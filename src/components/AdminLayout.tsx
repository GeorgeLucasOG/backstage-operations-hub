
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Coffee, 
  List, 
  ShoppingCart, 
  Store, 
  LogOut,
  Receipt,
  DollarSign
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Painel", path: "/admin" },
    { icon: Store, label: "Restaurantes", path: "/admin/restaurants" },
    { icon: Coffee, label: "Produtos", path: "/admin/products" },
    { icon: List, label: "Categorias", path: "/admin/menu" },
    { icon: ShoppingCart, label: "Pedidos", path: "/admin/orders" },
    { icon: Receipt, label: "Contas a Receber", path: "/admin/accounts-receivable" },
    { icon: DollarSign, label: "Contas a Pagar", path: "/admin/accounts-payable" },
    { icon: ShoppingCart, label: "Caixa", path: "/admin/cash" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <h2 className="text-lg font-semibold">Painel Administrativo</h2>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </nav>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-6 bg-gray-50">
          <SidebarTrigger className="mb-4" />
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
