
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApiSettings = () => {
  const { toast } = useToast();
  const [freeConvertApiKey, setFreeConvertApiKey] = useState("");
  
  // Query to fetch the current API keys from settings
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["api-settings"],
    queryFn: async () => {
      console.log("Fetching API settings...");
      const { data, error } = await supabase.functions.invoke("get-api-settings", {});
      
      if (error) {
        console.error("Error fetching API settings:", error);
        throw error;
      }
      
      console.log("API settings retrieved:", data);
      return data;
    },
  });
  
  // Mutation to update API keys
  const updateApiKeyMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      console.log(`Updating ${key} API key...`);
      
      const { data, error } = await supabase.functions.invoke("update-api-setting", {
        body: { key, value }
      });
      
      if (error) {
        console.error(`Error updating ${key} API key:`, error);
        throw error;
      }
      
      console.log(`${key} API key updated successfully:`, data);
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Sucesso",
        description: `Chave de API ${variables.key} atualizada com sucesso!`,
      });
    },
    onError: (error, variables) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar chave de API ${variables.key}: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });
  
  // Effect to set the state from fetched data
  useState(() => {
    if (apiKeys?.freeConvertApiKey) {
      setFreeConvertApiKey(apiKeys.freeConvertApiKey);
    }
  });
  
  const handleFreeConvertApiKeySave = () => {
    updateApiKeyMutation.mutate({ key: "FREECONVERT_API_KEY", value: freeConvertApiKey });
  };
  
  const handleTestApi = async (apiName: string) => {
    try {
      toast({
        title: "Testando API",
        description: `Testando conexão com a API ${apiName}...`,
      });
      
      const { data, error } = await supabase.functions.invoke("test-api-connection", {
        body: { apiName }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Sucesso",
          description: `Conexão com a API ${apiName} realizada com sucesso!`,
        });
      } else {
        toast({
          title: "Erro",
          description: `Falha na conexão com a API ${apiName}: ${data.message}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error testing ${apiName} connection:`, error);
      toast({
        title: "Erro",
        description: `Erro ao testar conexão com a API ${apiName}: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações de APIs</h1>
      </div>
      
      <Tabs defaultValue="image-processing">
        <TabsList className="mb-4">
          <TabsTrigger value="image-processing">Processamento de Imagens</TabsTrigger>
          <TabsTrigger value="other" disabled>Outras APIs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="image-processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FreeConvert API</CardTitle>
              <CardDescription>
                Configuração da API para conversão e redimensionamento de imagens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="freeconvert-api-key" className="text-sm font-medium">
                  Chave da API (API Key)
                </label>
                <div className="flex gap-2">
                  <Input
                    id="freeconvert-api-key"
                    type="password"
                    value={freeConvertApiKey}
                    onChange={(e) => setFreeConvertApiKey(e.target.value)}
                    placeholder="Insira sua chave de API do FreeConvert"
                  />
                  <Button 
                    onClick={handleFreeConvertApiKeySave}
                    disabled={updateApiKeyMutation.isPending}
                  >
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenha sua chave em{" "}
                  <a 
                    href="https://www.freeconvert.com/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    freeconvert.com/api
                  </a>
                </p>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleTestApi('freeconvert')}
                  disabled={!freeConvertApiKey}
                >
                  Testar Conexão
                </Button>
              </div>
              
              <div className="space-y-2 pt-4">
                <h3 className="text-sm font-medium">Configurações de Redimensionamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium">Avatar de Restaurante</h4>
                    <p className="text-sm text-muted-foreground">82 x 82 pixels</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium">Capa de Restaurante</h4>
                    <p className="text-sm text-muted-foreground">390 x 250 pixels</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium">Imagem de Produto</h4>
                    <p className="text-sm text-muted-foreground">356 x 356 pixels</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiSettings;
