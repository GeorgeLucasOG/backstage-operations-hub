
import { useState, useRef } from "react";
import { Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  onUpload: (url: string) => void;
  currentImageUrl: string;
  folder?: string;
}

const ImageUploadField = ({
  id,
  label,
  onUpload,
  currentImageUrl,
  folder = "",
}: ImageUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas arquivos JPEG, JPG, PNG ou WEBP são permitidos.",
        variant: "destructive",
      });
      return;
    }

    // Show preview immediately for better UX
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    
    try {
      // First upload the original file to get a URL
      const filename = `${folder ? folder + '/' : ''}${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('restaurant-images')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from('restaurant-images')
        .getPublicUrl(filename);

      // Now convert to WebP using our edge function
      toast({
        title: "Processando",
        description: "Convertendo imagem para WebP para melhor desempenho...",
      });

      const response = await supabase.functions.invoke('convert-to-webp', {
        body: { 
          imageUrl: urlData.publicUrl,
          folder: folder || undefined
        }
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Falha na conversão da imagem');
      }

      // Use the WebP URL
      onUpload(response.data.publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada e otimizada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: `Erro ao fazer upload: ${(error as Error).message}`,
        variant: "destructive",
      });
      setPreviewUrl(currentImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Aceita imagens nos formatos JPEG, JPG, PNG ou WEBP. As imagens serão otimizadas automaticamente.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex flex-col gap-4">
        {previewUrl && (
          <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
            <img 
              src={previewUrl} 
              alt={label} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={triggerFileInput}
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Processando..." : "Escolher Imagem"}
          </Button>
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
