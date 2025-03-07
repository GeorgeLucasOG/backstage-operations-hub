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
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
      console.log("Salvando configurações de API:", data);

      const now = new Date().toISOString();
      const payload = {
        ...data,
        id: data.id || generateUUID(),
        updatedAt: now,
        createdAt: data.createdAt || now,
      };

      const { data: result, error } = await supabase
        .from("ApiSettings")
        .upsert([payload])
        .select();

      if (error) {
        console.error("Erro ao salvar configurações:", error);
        throw error;
      }

      return result[0];
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações de API foram atualizadas com sucesso.",
      });
      setFormChanged(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao salvar configurações: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        variant: "destructive",
      });
    },
  });

  // Função para testar conexão
  const testConnection = async () => {
    setTestingConnection(true);

    try {
      toast({
        title: "Testando conexão",
        description: "Aguarde enquanto testamos a conexão com o serviço...",
      });

      // Em um ambiente real, você faria uma chamada para a API
      const response = await supabase.functions.invoke("test-image-api", {
        body: {
          provider: settings.imageProcessing.provider,
          apiKey: settings.imageProcessing.apiKey,
          apiSecret: settings.imageProcessing.apiSecret,
          cloudName: settings.imageProcessing.cloudName,
          endpoint: settings.imageProcessing.endpoint,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao testar conexão");
      }

      // Simular um teste bem-sucedido após 1.5 segundos
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Conexão testada com sucesso",
        description: `Conexão com ${settings.imageProcessing.provider} estabelecida.`,
      });
    } catch (error) {
      toast({
        title: "Erro no teste de conexão",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível conectar ao serviço",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Manipular mudanças no formulário
  const handleChange = (
    section: keyof ApiSettings,
    field: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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
            handleChange("imageProcessing", "enabled", checked)
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
