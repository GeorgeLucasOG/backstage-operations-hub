
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiName } = await req.json();

    if (!apiName) {
      throw new Error('API name is required');
    }

    // Test different APIs based on the name
    if (apiName === 'freeconvert') {
      const API_KEY = Deno.env.get('FREECONVERT_API_KEY');
      if (!API_KEY) {
        throw new Error('FREECONVERT_API_KEY not found in environment variables');
      }

      // Make a simple request to test the API connection
      const response = await fetch('https://api.freeconvert.com/v1/user', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API responded with status ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const userData = await response.json();

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'API connection successful', 
          data: { 
            user: userData.data?.email || 'User authenticated'
          } 
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      );
    } else {
      throw new Error(`Unknown API name: ${apiName}`);
    }
  } catch (error) {
    console.error(`Error testing API connection:`, error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
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
