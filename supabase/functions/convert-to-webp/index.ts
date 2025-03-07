
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Predefined image dimensions for different purposes
const imageDimensions = {
  'restaurant/avatar': { width: 82, height: 82 },
  'restaurant/cover': { width: 390, height: 250 },
  'products': { width: 356, height: 356 },
  // Default dimensions if no specific type is matched
  'default': { width: 800, height: 600 }
};

// Detect image purpose based on folder path
const detectImagePurpose = (folder: string, filename: string) => {
  if (folder === 'restaurant') {
    // For restaurant avatars and covers, we check if it contains 'avatar' in the filename
    if (filename.toLowerCase().includes('avatar')) {
      return 'restaurant/avatar';
    }
    return 'restaurant/cover';
  } else if (folder === 'products' || folder.startsWith('products/')) {
    return 'products';
  }
  return 'default';
};

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const API_KEY = Deno.env.get('FREECONVERT_API_KEY');
    if (!API_KEY) {
      throw new Error('FREECONVERT_API_KEY not found in environment variables');
    }

    // Parse the request body to get the image URL
    const { imageUrl, folder, purpose } = await req.json();

    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    console.log('Converting image:', imageUrl);
    console.log('Folder:', folder || 'root');
    
    // Determine image purpose and dimensions
    const filename = imageUrl.split('/').pop().split('?')[0];
    const imagePurpose = purpose || detectImagePurpose(folder || '', filename);
    const dimensions = imageDimensions[imagePurpose] || imageDimensions.default;
    
    console.log('Detected purpose:', imagePurpose);
    console.log('Using dimensions:', dimensions);

    // Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const originalImageBlob = await imageResponse.blob();
    
    // Step 1: Initiate the conversion job with FreeConvert API
    const importResponse = await fetch('https://api.freeconvert.com/v1/process/import/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        url: imageUrl
      })
    });

    if (!importResponse.ok) {
      throw new Error(`Failed to start conversion: ${await importResponse.text()}`);
    }

    const importResult = await importResponse.json();
    const importTask = importResult.data.id;
    
    // Step 2: Resize the image
    const resizeResponse = await fetch('https://api.freeconvert.com/v1/process/image/resize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        input: importTask,
        width: dimensions.width,
        height: dimensions.height,
        fit: 'cover',
        position: 'center'
      })
    });

    if (!resizeResponse.ok) {
      throw new Error(`Failed to resize image: ${await resizeResponse.text()}`);
    }

    const resizeResult = await resizeResponse.json();
    const resizeTask = resizeResult.data.id;
    
    // Step 3: Convert to WebP
    const convertResponse = await fetch('https://api.freeconvert.com/v1/process/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        input: resizeTask,
        input_format: imageUrl.split('.').pop().toLowerCase(),
        output_format: 'webp',
        options: {
          quality: 80
        }
      })
    });

    if (!convertResponse.ok) {
      throw new Error(`Failed to convert image: ${await convertResponse.text()}`);
    }

    const convertResult = await convertResponse.json();
    const convertTask = convertResult.data.id;
    
    // Step 4: Export the result
    const exportResponse = await fetch('https://api.freeconvert.com/v1/process/export/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        input: convertTask
      })
    });

    if (!exportResponse.ok) {
      throw new Error(`Failed to export converted image: ${await exportResponse.text()}`);
    }

    const exportResult = await exportResponse.json();
    
    // Step 5: Wait for the export URL
    let exportUrl = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!exportUrl && attempts < maxAttempts) {
      attempts++;
      
      const statusResponse = await fetch(`https://api.freeconvert.com/v1/process/status/${exportResult.data.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check export status: ${await statusResponse.text()}`);
      }
      
      const statusResult = await statusResponse.json();
      
      if (statusResult.data.status === 'completed' && statusResult.data.url) {
        exportUrl = statusResult.data.url;
      } else if (statusResult.data.status === 'failed') {
        throw new Error('Export failed');
      } else {
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!exportUrl) {
      throw new Error('Failed to get export URL after multiple attempts');
    }
    
    // Step 6: Download the converted WebP file
    const webpResponse = await fetch(exportUrl);
    if (!webpResponse.ok) {
      throw new Error(`Failed to download converted image: ${webpResponse.statusText}`);
    }
    
    const webpBlob = await webpResponse.blob();
    
    // Step 7: Upload to Supabase storage
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://rnyjdamaqjxplmpskdry.supabase.co';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJueWpkYW1hcWp4cGxtcHNrZHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyODY0NzAsImV4cCI6MjA1NTg2MjQ3MH0.5SCi-dcxw2qB0zj9-K5OCzF1vRb1Ymb6XCTxG4eeOQg';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Create a unique filename
    const timestamp = Date.now();
    const originalFilename = imageUrl.split('/').pop().split('?')[0];
    const filenameBase = originalFilename.split('.')[0];
    const path = folder ? `${folder}/${timestamp}-${filenameBase}.webp` : `${timestamp}-${filenameBase}.webp`;
    
    // Upload the WebP image to Supabase Storage
    const { data, error } = await supabase.storage
      .from('restaurant-images')
      .upload(path, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('restaurant-images')
      .getPublicUrl(path);
    
    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: urlData.publicUrl,
        originalUrl: imageUrl,
        dimensions: dimensions,
        purpose: imagePurpose
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing image:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
