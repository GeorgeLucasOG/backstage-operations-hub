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

/**
 * Obter configurações de API para processamento de imagens
 */
export async function getImageProcessingSettings() {
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

    return data[0].imageProcessing;
  } catch (error) {
    console.error("Erro ao processar configurações:", error);
    return { enabled: false, provider: "internal" };
  }
}

/**
 * Obter configurações de imagem com base no propósito
 * @param purpose Propósito da imagem (avatar, capa, produto)
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
 * Processar uma imagem com base em seu propósito e configurações
 * @param imageUrl URL da imagem original
 * @param purpose Propósito da imagem
 */
export async function processImage(imageUrl: string, purpose: string) {
  try {
    if (!imageUrl) {
      throw new Error("URL de imagem não fornecida");
    }

    // Buscar configurações de processamento
    const settings = await getImageProcessingSettings();

    // Se o processamento estiver desabilitado, retornar a URL original
    if (!settings.enabled) {
      console.log(
        "Processamento de imagem desabilitado. Retornando URL original."
      );
      return { publicUrl: imageUrl, success: true };
    }

    // Obter configurações com base no propósito
    const config = getImageConfig(purpose);
    console.log(`Processando imagem para ${purpose}:`, config);

    // Diferentes implementações de acordo com o provedor configurado
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
      error: error instanceof Error ? error.message : "Erro desconhecido",
      publicUrl: imageUrl,
    };
  }
}

/**
 * Processar imagem com o provedor interno
 */
async function processWithInternalProvider(
  imageUrl: string,
  config: ImageConfig
) {
  // Aqui você implementaria o redimensionamento internamente ou usando uma biblioteca
  // Como exemplo, vamos apenas adicionar parâmetros à URL original
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
  settings: any
) {
  // Verificar se temos as credenciais necessárias
  if (!settings.cloudName) {
    console.warn("Cloud Name do Cloudinary não configurado");
    return processWithInternalProvider(imageUrl, config);
  }

  try {
    // Gerar uma URL de transformação do Cloudinary
    // Exemplo: https://res.cloudinary.com/minha-cloud/image/fetch/c_fill,w_300,h_200/https://exemplo.com/imagem.jpg
    const cloudinaryBaseUrl = `https://res.cloudinary.com/${settings.cloudName}/image/fetch`;
    const transformations = [];

    // Adicionar transformações com base no mode
    if (config.mode === "contain") {
      transformations.push("c_fit");
    } else if (config.mode === "cover") {
      transformations.push("c_fill,g_auto");
    } else {
      transformations.push("c_scale");
    }

    // Adicionar dimensões
    transformations.push(`w_${config.width},h_${config.height}`);

    // Adicionar formato (webp para melhor performance)
    transformations.push("f_auto,q_auto");

    // Montar a URL final
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
  settings: any
) {
  // Verificar se temos as credenciais necessárias
  if (!settings.endpoint) {
    console.warn("Endpoint do Imgix não configurado");
    return processWithInternalProvider(imageUrl, config);
  }

  try {
    // Remover qualquer trailing slash do endpoint
    const endpoint = settings.endpoint.replace(/\/$/, "");

    // Parâmetros Imgix
    const params = new URLSearchParams();

    // Configurar o modo de redimensionamento
    if (config.mode === "contain") {
      params.append("fit", "max");
    } else if (config.mode === "cover") {
      params.append("fit", "crop");
      params.append("crop", "faces,entropy");
    } else {
      params.append("fit", "scale");
    }

    // Adicionar dimensões
    params.append("w", config.width.toString());
    params.append("h", config.height.toString());

    // Otimização e formato
    params.append("auto", "format,compress");

    // Montar a URL
    // Imgix pode usar proxy ou origem direta
    // Aqui estamos usando proxy (encodeURIComponent para a URL original)
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
  settings: any
) {
  // Verificar se temos o endpoint necessário
  if (!settings.endpoint) {
    console.warn("Endpoint personalizado não configurado");
    return processWithInternalProvider(imageUrl, config);
  }

  try {
    // Fazer requisição para o endpoint personalizado
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
}) {
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
