import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Importando o componente ApiSettings existente
import ApiSettings from "./ApiSettings";

/**
 * Página de configurações com sistema de abas
 */
const Settings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extrair a aba ativa da URL ou usar "general" como padrão
  const getActiveTabFromUrl = (): string => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("tab") || "general";
  };

  const [activeTab, setActiveTab] = useState<string>(getActiveTabFromUrl());

  // Atualizar a URL quando a aba mudar
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/admin/settings?tab=${tab}`, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as opções básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Conteúdo das configurações gerais vai aqui...</p>
              {/* Adicionar conteúdo das configurações gerais quando necessário */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          {/* Usar o componente ApiSettings existente */}
          <ApiSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie como e quando você recebe notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Conteúdo das configurações de notificações vai aqui...</p>
              {/* Adicionar conteúdo das configurações de notificações quando necessário */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Conteúdo das configurações de aparência vai aqui...</p>
              {/* Adicionar conteúdo das configurações de aparência quando necessário */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
