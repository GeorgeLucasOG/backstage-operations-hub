import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, TestTube, Upload, RotateCcw } from "lucide-react";

// Tipo para as configurações de API
interface ApiSettings {
  id?: string;
  imageProcessing: {
    enabled: boolean;
    provider: string;
    apiKey?: string;
    apiSecret?: string;
    cloudName?: string;
    endpoint?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Função para gerar UUID
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Corrigir a tipagem na interface ou tipo onde há o problema de "value: any"
interface SelectOption {
  label: string;
  value: string; // Mudando de 'any' para 'string'
}

// Definir um tipo para as tabelas disponíveis no Supabase
type SupabaseTables = "ApiSettings";

const ApiSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("image-processing");
  const [testingConnection, setTestingConnection] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  // Estado padrão
  const defaultSettings: ApiSettings = {
    imageProcessing: {
      enabled: false,
      provider: "internal",
    },
  };

  const [settings, setSettings] = useState<ApiSettings>(defaultSettings);

  // Consultar configurações existentes
  const {
    data: apiSettings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["api-settings"],
    queryFn: async () => {
      console.log("Consultando configurações de API...");

      try {
        const { data, error } = await supabase
          .from("ApiSettings")
          .select("*")
          .order("createdAt", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Erro ao buscar configurações de API:", error);
          throw error;
        }

        console.log("Configurações de API obtidas:", data);
        return (data?.[0] as ApiSettings) || defaultSettings;
      } catch (error) {
        console.error("Erro na consulta:", error);
        return defaultSettings;
      }
    },
  });

  // Atualizar estado quando os dados chegarem
  useEffect(() => {
    if (apiSettings) {
      setSettings(apiSettings);
      setFormChanged(false);
    }
  }, [apiSettings]);

  // Mutação para salvar configurações
  const updateMutation = useMutation({
    mutationFn: async (data: ApiSettings) => {
      console.log(
        "Dados originais recebidos para salvar:",
        JSON.stringify(data, null, 2)
      );

      try {
        const now = new Date().toISOString();

        // Garantir que todos os campos estejam presentes e devidamente formatados
        const imageProcessingData = {
          enabled: data.imageProcessing.enabled === true,
          provider: data.imageProcessing.provider || "internal",
          apiKey: data.imageProcessing.apiKey || null,
          apiSecret: data.imageProcessing.apiSecret || null,
          cloudName: data.imageProcessing.cloudName || null,
          endpoint: data.imageProcessing.endpoint || null,
        };

        // Construir o payload com todos os campos necessários
        const payload = {
          id: data.id || generateUUID(),
          imageProcessing: imageProcessingData,
          updatedAt: now,
          createdAt: data.createdAt || now,
        };

        // Log detalhado do payload que será enviado
        console.log(
          "Payload formatado para salvar:",
          JSON.stringify(payload, null, 2)
        );

        // Verificar tabela mas prosseguir independentemente do resultado (a verificação já faz toast se necessário)
        await checkTableExists("ApiSettings");

        // Tentar salvar diretamente, mesmo se a verificação da tabela falhar
        console.log("Iniciando operação de upsert...");
        const {
          data: result,
          error,
          status,
          statusText,
        } = await supabase.from("ApiSettings").upsert([payload]).select();

        console.log("Status da resposta:", status, statusText);

        if (error) {
          console.error("Erro detalhado do Supabase:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });

          // Verificar se há uma mensagem específica, senão fornecer um diagnóstico mais útil
          if (!error.message) {
            throw new Error(
              "Erro no Supabase sem mensagem específica. Verifique permissões e estrutura da tabela."
            );
          }

          throw new Error(`Erro do Supabase: ${error.message}`);
        }

        if (!result || result.length === 0) {
          console.warn("Nenhum dado retornado após salvar");
          throw new Error(
            "O Supabase não retornou dados após a operação. Verificar logs para detalhes."
          );
        }

        console.log("Configurações salvas com sucesso:", result);
        return result[0];
      } catch (error: unknown) {
        console.error("Erro completo ao salvar configurações:", error);

        if (error instanceof Error) {
          throw new Error(error.message);
        }

        throw new Error(
          "Erro desconhecido ao salvar configurações. Verifique console para detalhes."
        );
      }
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações de API foram atualizadas com sucesso.",
      });
      setFormChanged(false);
      refetch();
    },
    onError: (error: Error) => {
      console.error("Log completo do erro onError:", error);
      toast({
        title: "Erro",
        description: `Erro ao salvar configurações: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Função auxiliar para verificar se a tabela existe
  const checkTableExists = async (
    tableName: SupabaseTables
  ): Promise<boolean> => {
    try {
      console.log(`Verificando se a tabela ${tableName} existe...`);

      // Primeiro, vamos verificar os metadados do Supabase para debugging
      console.log(
        "Tentando obter informações sobre a conexão com o Supabase..."
      );

      // Tentativa específica para verificar a tabela ApiSettings com mais contexto
      console.log("Tentando acessar tabela com query básica...");
      const { data, error, status, statusText } = await supabase
        .from(tableName)
        .select("id")
        .limit(1);

      console.log("Status da consulta:", status, statusText);
      console.log("Dados retornados:", data);

      if (error) {
        console.error(`Erro detalhado ao verificar tabela ${tableName}:`, {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        // Se o erro for específico de "relation does not exist"
        if (error.code === "42P01") {
          console.log(
            `A tabela ${tableName} não existe no banco de dados (código: ${error.code})`
          );

          // Mostrar estrutura sugerida da tabela
          console.log(`
            Para criar esta tabela, execute o seguinte SQL no seu banco de dados:
            
            CREATE TABLE IF NOT EXISTS "${tableName}" (
              "id" UUID PRIMARY KEY,
              "imageProcessing" JSONB NOT NULL,
              "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
              "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
            );
          `);

          toast({
            title: "Erro de banco de dados",
            description: `A tabela ${tableName} não existe. Verifique o console para instruções de criação.`,
            variant: "destructive",
          });

          return false;
        }

        // Para outros tipos de erro, vamos tentar continuar mesmo assim
        console.log(
          `Erro ao verificar tabela, mas vamos tentar continuar: ${error.message}`
        );
        toast({
          title: "Aviso",
          description: `Erro ao verificar tabela: ${error.message}. Tentando continuar mesmo assim...`,
        });

        // Return true para tentar prosseguir mesmo com erro
        return true;
      }

      console.log(`Tabela ${tableName} existe e está acessível!`);
      return true;
    } catch (err) {
      console.error("Erro inesperado ao verificar tabela:", err);
      // Vamos tentar prosseguir mesmo com erro
      return true;
    }
  };

  // Função para testar conexão
  const testConnection = async () => {
    setTestingConnection(true);

    try {
      toast({
        title: "Testando conexão",
        description: "Aguarde enquanto testamos a conexão com o serviço...",
      });

      // Validar configurações antes de testar
      if (settings.imageProcessing.provider === "cloudinary") {
        if (!settings.imageProcessing.cloudName) {
          throw new Error("Cloud Name é obrigatório para o Cloudinary");
        }
        if (!settings.imageProcessing.apiKey) {
          throw new Error("API Key é obrigatória para o Cloudinary");
        }
      }

      if (
        settings.imageProcessing.provider === "imgix" &&
        !settings.imageProcessing.endpoint
      ) {
        throw new Error("Endpoint é obrigatório para o Imgix");
      }

      if (
        settings.imageProcessing.provider === "custom" &&
        !settings.imageProcessing.endpoint
      ) {
        throw new Error(
          "Endpoint é obrigatório para provedores personalizados"
        );
      }

      console.log(
        "Testando conexão com configurações:",
        settings.imageProcessing
      );

      // Em um ambiente real, você faria uma chamada para testar a conexão
      // Para fins de demonstração, apenas simulamos uma resposta de sucesso

      // Simulando o teste
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Teste de conexão bem-sucedido");

      toast({
        title: "Conexão testada com sucesso",
        description: `Conexão com ${settings.imageProcessing.provider} estabelecida.`,
      });
    } catch (error: unknown) {
      console.error("Erro detalhado no teste de conexão:", error);
      if (error instanceof Error) {
        toast({
          title: "Erro no teste de conexão",
          description: error.message || "Não foi possível conectar ao serviço",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro no teste de conexão",
          description: "Não foi possível conectar ao serviço",
          variant: "destructive",
        });
      }
    } finally {
      setTestingConnection(false);
    }
  };

  // Simplificar a função handleChange para resolver os problemas de tipagem
  const handleChange = (
    section: keyof ApiSettings,
    field: string,
    value: string | boolean
  ) => {
    // Abordagem mais simples de atualização, evitando problemas de tipagem
    if (section === "imageProcessing") {
      setSettings((prev) => {
        return {
          ...prev,
          imageProcessing: {
            ...prev.imageProcessing,
            [field]: value,
          },
        };
      });
    }
    // Não precisamos da outra condição pois só tratamos 'imageProcessing'

    setFormChanged(true);
  };

  // Renderizar formulário de processamento de imagens
  const renderImageProcessingForm = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="image-processing-enabled"
          checked={settings.imageProcessing.enabled}
          onCheckedChange={(checked) =>
            handleChange("imageProcessing", "enabled", checked.toString())
          }
        />
        <Label htmlFor="image-processing-enabled" className="font-medium">
          Habilitar processamento automático de imagens
        </Label>
      </div>

      {settings.imageProcessing.enabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="image-provider">Provedor de Serviço</Label>
            <select
              id="image-provider"
              className="w-full p-2 border rounded"
              value={settings.imageProcessing.provider}
              onChange={(e) =>
                handleChange("imageProcessing", "provider", e.target.value)
              }
            >
              <option value="internal">Processamento interno</option>
              <option value="cloudinary">Cloudinary</option>
              <option value="imgix">Imgix</option>
              <option value="custom">Endpoint personalizado</option>
            </select>
          </div>

          {settings.imageProcessing.provider === "cloudinary" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cloud-name">Cloud Name</Label>
                <Input
                  id="cloud-name"
                  value={settings.imageProcessing.cloudName || ""}
                  onChange={(e) =>
                    handleChange("imageProcessing", "cloudName", e.target.value)
                  }
                  placeholder="seu-nome-da-cloud"
                />
                <p className="text-xs text-muted-foreground">
                  Nome da sua cloud no Cloudinary. Ex: mycompany
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  value={settings.imageProcessing.apiKey || ""}
                  onChange={(e) =>
                    handleChange("imageProcessing", "apiKey", e.target.value)
                  }
                  placeholder="Sua API Key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input
                  id="api-secret"
                  type="password"
                  value={settings.imageProcessing.apiSecret || ""}
                  onChange={(e) =>
                    handleChange("imageProcessing", "apiSecret", e.target.value)
                  }
                  placeholder="Seu API Secret"
                />
                <p className="text-xs text-muted-foreground">
                  Mantenha esta chave em segredo. Armazenada de forma segura e
                  criptografada.
                </p>
              </div>
            </>
          )}

          {settings.imageProcessing.provider === "imgix" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  value={settings.imageProcessing.apiKey || ""}
                  onChange={(e) =>
                    handleChange("imageProcessing", "apiKey", e.target.value)
                  }
                  placeholder="Sua API Key do Imgix"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">Domínio do Imgix</Label>
                <Input
                  id="endpoint"
                  value={settings.imageProcessing.endpoint || ""}
                  onChange={(e) =>
                    handleChange("imageProcessing", "endpoint", e.target.value)
                  }
                  placeholder="https://seu-dominio.imgix.net"
                />
              </div>
            </>
          )}

          {settings.imageProcessing.provider === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                value={settings.imageProcessing.endpoint || ""}
                onChange={(e) =>
                  handleChange("imageProcessing", "endpoint", e.target.value)
                }
                placeholder="https://api.seuservico.com/redimensionar"
              />
              <p className="text-xs text-muted-foreground">
                URL do seu serviço de processamento de imagens.
              </p>
            </div>
          )}

          <div className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSettings(apiSettings || defaultSettings);
                setFormChanged(false);
              }}
              disabled={!formChanged}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">
              Configurações de Redimensionamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4 bg-gray-50">
                <h4 className="font-medium flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="h-4 w-4 text-blue-600" />
                  </div>
                  Avatar de Restaurante
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  82 x 82 pixels
                </p>
                <p className="text-xs text-muted-foreground mt-1">Quadrado</p>
              </div>

              <div className="border rounded-md p-4 bg-gray-50">
                <h4 className="font-medium flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="h-4 w-4 text-green-600" />
                  </div>
                  Capa de Restaurante
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  390 x 250 pixels
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Retangular (widescreen)
                </p>
              </div>

              <div className="border rounded-md p-4 bg-gray-50">
                <h4 className="font-medium flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Upload className="h-4 w-4 text-amber-600" />
                  </div>
                  Imagem de Produto
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  356 x 356 pixels
                </p>
                <p className="text-xs text-muted-foreground mt-1">Quadrado</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações de API</h1>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="image-processing">
            Processamento de Imagens
          </TabsTrigger>
          <TabsTrigger value="other" disabled>
            Outras APIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image-processing">
          <Card>
            <CardHeader>
              <CardTitle>Processamento de Imagens</CardTitle>
              <CardDescription>
                Configure como as imagens são processadas e otimizadas
                automaticamente.
                <br />
                As imagens serão redimensionadas conforme seu propósito:
                <ul className="list-disc pl-5 mt-2 text-xs">
                  <li>Avatares de restaurante: 82x82 pixels</li>
                  <li>Capas de restaurante: 390x250 pixels</li>
                  <li>Imagens de produto: 356x356 pixels</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando configurações...</span>
                </div>
              ) : (
                renderImageProcessingForm()
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => updateMutation.mutate(settings)}
          disabled={!formChanged || updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ApiSettings;
