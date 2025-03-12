import { useState, useRef } from "react";
import { Upload, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { convertToWebp } from "@/functions/image-processing";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageUploadFieldProps {
  id?: string;
  label?: string;
  onUpload?: (url: string) => void;
  currentImageUrl?: string;
  currentUrl?: string;
  onUrlChange?: (url: string) => void;
  folder?: string;
  purpose?: "restaurant-avatar" | "restaurant-cover" | "product-image";
}

const ImageUploadField = ({
  id = "image-upload",
  label = "",
  onUpload,
  currentImageUrl,
  currentUrl,
  onUrlChange,
  folder = "",
  purpose,
}: ImageUploadFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const effectiveCurrentUrl = currentUrl || currentImageUrl || "";
  const [previewUrl, setPreviewUrl] = useState(effectiveCurrentUrl);

  const handleUrlChange = (url: string) => {
    if (onUrlChange) onUrlChange(url);
    if (onUpload) onUpload(url);
  };

  const { toast } = useToast();

  // Determine image dimensions for the UI based on purpose
  const getDimensionsDisplay = () => {
    switch (purpose) {
      case "restaurant-avatar":
        return "82 x 82";
      case "restaurant-cover":
        return "390 x 250";
      case "product-image":
        return "356 x 356";
      default:
        return "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
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
      const filename = `${folder ? folder + "/" : ""}${Date.now()}-${
        file.name
      }`;
      const { data, error } = await supabase.storage
        .from("restaurant-images")
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from("restaurant-images")
        .getPublicUrl(filename);

      // Now convert to WebP using our edge function
      toast({
        title: "Processando",
        description: "Convertendo e redimensionando imagem...",
      });

      const result = await convertToWebp({
        imageUrl: urlData.publicUrl,
        purpose: purpose,
      });

      if (!result.success) {
        throw new Error("Falha na conversão da imagem");
      }

      // Use the WebP URL
      handleUrlChange(result.publicUrl);

      toast({
        title: "Sucesso",
        description: "Imagem enviada, otimizada e redimensionada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: `Erro ao fazer upload: ${(error as Error).message}`,
        variant: "destructive",
      });
      setPreviewUrl(effectiveCurrentUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const dimensionsDisplay = getDimensionsDisplay();

  return (
    <div className="space-y-2">
      {label && (
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
                <p>
                  Aceita imagens nos formatos JPEG, JPG, PNG ou WEBP. As imagens
                  serão otimizadas automaticamente.
                  {dimensionsDisplay &&
                    ` Dimensões: ${dimensionsDisplay} pixels.`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

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
