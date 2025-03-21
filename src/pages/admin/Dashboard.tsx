import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, ShoppingCart, Menu as MenuIcon, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface DashboardStats {
  products: number;
  menuItems: number;
  activeOrders: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    menuItems: 0,
    activeOrders: 0,
  });

  // Simular carregamento de dados baseados no negócio do usuário
  useEffect(() => {
    // Em uma aplicação real, você faria uma chamada à API com o ID do negócio
    // Exemplo: fetchStats(user?.businessId)

    // Simulação de dados diferentes para cada restaurante
    const loadStats = () => {
      if (user) {
        // Gerar números baseados no ID do usuário para simular diferentes valores
        const seed = parseInt(user.id) || 1;
        setStats({
          products: 10 + (seed % 10),
          menuItems: 20 + (seed % 15),
          activeOrders: 1 + (seed % 5),
        });
      }
    };

    loadStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Painel</h1>
        <div className="flex items-center text-lg text-gray-700 bg-white px-4 py-2 rounded-md shadow-sm">
          <Store className="h-5 w-5 mr-2 text-blue-600" />
          <span>{user?.businessName || "Restaurante"}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Coffee className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados no seu restaurante
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Itens no Cardápio
            </CardTitle>
            <MenuIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menuItems}</div>
            <p className="text-xs text-muted-foreground">
              Itens ativos no seu cardápio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Pedidos Ativos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos em andamento no momento
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Informações do Restaurante
        </h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Nome:</span> {user?.businessName}
          </div>
          <div>
            <span className="font-medium">Proprietário:</span> {user?.name}
          </div>
          <div>
            <span className="font-medium">Email de contato:</span> {user?.email}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
