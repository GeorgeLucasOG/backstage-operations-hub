
/**
 * Funções para processamento de imagens
 */

import { supabase } from "@/integrations/supabase/client";

// Interface para as configurações de imagem
interface ImageConfig {
  width: number;
  height: number;
  mode: "contain" | "cover" | "stretch";
}

// Interface para configurações de API
interface ImageProcessingSettings {
  enabled: boolean;
  provider: string;
  cloudName?: string;
  endpoint?: string;
  apiKey?: string;
}

/**
 * Obter configurações de API para processamento de imagens
 */
export async function getImageProcessingSettings(): Promise<ImageProcessingSettings> {
  try {
    const { data, error } = await supabase
      .from("ApiSettings")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(1);

    if (error) {
      console.error(
        "Erro ao buscar configurações de processamento de imagem:",
        error
      );
      return { enabled: false, provider: "internal" };
    }

    if (!data || data.length === 0) {
      return { enabled: false, provider: "internal" };
    }

    const settings = data[0].imageProcessing as any;
    return {
      enabled: settings?.enabled || false,
      provider: settings?.provider || "internal",
      cloudName: settings?.cloudName,
      endpoint: settings?.endpoint,
      apiKey: settings?.apiKey,
    };
  } catch (error) {
    console.error("Erro ao processar configurações:", error);
    return { enabled: false, provider: "internal" };
  }
}

/**
 * Obter configurações de imagem com base no propósito
 */
export function getImageConfig(purpose: string): ImageConfig {
  switch (purpose) {
    case "restaurant-avatar":
      return { width: 82, height: 82, mode: "contain" };
    case "restaurant-cover":
      return { width: 390, height: 250, mode: "cover" };
    case "product-image":
      return { width: 356, height: 356, mode: "contain" };
    default:
      return { width: 500, height: 500, mode: "contain" };
  }
}

/**
 * Interface para resultado do processamento
 */
interface ProcessResult {
  success: boolean;
  publicUrl: string;
  error?: string;
  meta?: any;
}

/**
 * Processar uma imagem com base em seu propósito e configurações
 */
export async function processImage(imageUrl: string, purpose: string): Promise<ProcessResult> {
  try {
    if (!imageUrl) {
      throw new Error("URL de imagem não fornecida");
    }

    const settings = await getImageProcessingSettings();

    if (!settings.enabled) {
      console.log("Processamento de imagem desabilitado. Retornando URL original.");
      return { success: true, publicUrl: imageUrl };
    }

    const config = getImageConfig(purpose);
    console.log(`Processando imagem para ${purpose}:`, config);

    switch (settings.provider) {
      case "cloudinary":
        return processWithCloudinary(imageUrl, config, settings);
      case "imgix":
        return processWithImgix(imageUrl, config, settings);
      case "custom":
        return processWithCustomProvider(imageUrl, config, settings);
      default:
        return processWithInternalProvider(imageUrl, config);
    }
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    return {
      success: false,
      publicUrl: imageUrl,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Processar imagem com o provedor interno
 */
async function processWithInternalProvider(
  imageUrl: string,
  config: ImageConfig
): Promise<ProcessResult> {
  const separator = imageUrl.includes("?") ? "&" : "?";
  const processedUrl = `${imageUrl}${separator}width=${config.width}&height=${config.height}&resize=${config.mode}`;

  return {
    success: true,
    publicUrl: processedUrl,
    meta: {
      provider: "internal",
      width: config.width,
      height: config.height,
      mode: config.mode,
    },
  };
}

/**
 * Processar imagem com Cloudinary
 */
async function processWithCloudinary(
  imageUrl: string,
  config: ImageConfig,
  settings: ImageProcessingSettings
): Promise<ProcessResult> {
  if (!settings.cloudName) {
    console.warn("Cloud Name do Cloudinary não configurado");
    return processWithInternalProvider(imageUrl, config);
  }

  try {
    const cloudinaryBaseUrl = `https://res.cloudinary.com/${settings.cloudName}/image/fetch`;
    const transformations = [];

    if (config.mode === "contain") {
      transformations.push("c_fit");
    } else if (config.mode === "cover") {
      transformations.push("c_fill,g_auto");
    } else {
      transformations.push("c_scale");
    }

    transformations.push(`w_${config.width},h_${config.height}`);
    transformations.push("f_auto,q_auto");

    const transformationString = transformations.join(",");
    const processedUrl = `${cloudinaryBaseUrl}/${transformationString}/${encodeURIComponent(
      imageUrl
    )}`;

    return {
      success: true,
      publicUrl: processedUrl,
      meta: {
        provider: "cloudinary",
        cloudName: settings.cloudName,
        width: config.width,
        height: config.height,
        mode: config.mode,
      },
    };
  } catch (error) {
    console.error("Erro ao processar com Cloudinary:", error);
    return processWithInternalProvider(imageUrl, config);
  }
}

/**
 * Processar imagem com Imgix
 */
async function processWithImgix(
  imageUrl: string,
  config: ImageConfig,
  settings: ImageProcessingSettings
): Promise<ProcessResult> {
  if (!settings.endpoint) {
    console.warn("Endpoint do Imgix não configurado");
    return processWithInternalProvider(imageUrl, config);
  }

  try {
    const endpoint = settings.endpoint.replace(/\/$/, "");
    const params = new URLSearchParams();

    if (config.mode === "contain") {
      params.append("fit", "max");
    } else if (config.mode === "cover") {
      params.append("fit", "crop");
      params.append("crop", "faces,entropy");
    } else {
      params.append("fit", "scale");
    }

    params.append("w", config.width.toString());
    params.append("h", config.height.toString());
    params.append("auto", "format,compress");

    const processedUrl = `${endpoint}/${encodeURIComponent(
      imageUrl
    )}?${params.toString()}`;

    return {
      success: true,
      publicUrl: processedUrl,
      meta: {
        provider: "imgix",
        endpoint: settings.endpoint,
        width: config.width,
        height: config.height,
        mode: config.mode,
      },
    };
  } catch (error) {
    console.error("Erro ao processar com Imgix:", error);
    return processWithInternalProvider(imageUrl, config);
  }
}

/**
 * Processar imagem com provedor personalizado
 */
async function processWithCustomProvider(
  imageUrl: string,
  config: ImageConfig,
  settings: ImageProcessingSettings
): Promise<ProcessResult> {
  if (!settings.endpoint) {
    console.warn("Endpoint personalizado não configurado");
    return processWithInternalProvider(imageUrl, config);
  }

  try {
    const response = await fetch(settings.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: settings.apiKey ? `Bearer ${settings.apiKey}` : "",
      },
      body: JSON.stringify({
        url: imageUrl,
        width: config.width,
        height: config.height,
        mode: config.mode,
        format: "webp",
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta do provedor: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      publicUrl: data.url || imageUrl,
      meta: {
        provider: "custom",
        endpoint: settings.endpoint,
        width: config.width,
        height: config.height,
        mode: config.mode,
        responseData: data,
      },
    };
  } catch (error) {
    console.error("Erro ao processar com provedor personalizado:", error);
    return processWithInternalProvider(imageUrl, config);
  }
}

/**
 * Função edge para converter e redimensionar imagens
 */
export async function convertToWebp(options: {
  imageUrl: string;
  purpose?: string;
}): Promise<ProcessResult> {
  const { imageUrl, purpose = "default" } = options;

  try {
    const result = await processImage(imageUrl, purpose);
    return result;
  } catch (error) {
    console.error("Erro na conversão de imagem:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido na conversão",
      publicUrl: imageUrl,
    };
  }
}
