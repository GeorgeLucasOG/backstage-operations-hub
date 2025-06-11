
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate("/admin");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Admin Menu Master</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema completo de gestão para restaurantes com controle de cardápio, 
            pedidos, estoque e financeiro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🍽️ Gestão de Cardápio
              </CardTitle>
              <CardDescription>
                Controle completo de produtos, categorias e preços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Organize seu menu com categorias, adicione fotos dos pratos e 
                gerencie preços facilmente.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📦 Controle de Pedidos
              </CardTitle>
              <CardDescription>
                Acompanhe pedidos em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Gerencie pedidos desde o recebimento até a entrega, 
                com status atualizados automaticamente.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 Gestão Financeira
              </CardTitle>
              <CardDescription>
                Controle completo das finanças
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Monitore receitas, despesas, contas a pagar e 
                receber em um só lugar.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button 
            onClick={() => navigate("/login")} 
            size="lg"
            className="px-8 py-3 text-lg"
          >
            Acessar Sistema
          </Button>
          <p className="text-sm text-gray-500">
            Use: admin@admin.com / admin para fazer login
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
