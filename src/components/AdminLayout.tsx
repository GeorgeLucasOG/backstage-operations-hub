import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Coffee,
  List,
  ShoppingCart,
  Store,
  LogOut,
  Receipt,
  DollarSign,
  Settings,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

// Componente para o cabeçalho com responsividade aprimorada
const Header = () => {
  const location = useLocation();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para aplicar efeitos visuais
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Lista de páginas para encontrar o título atual
  const menuItems = [
    { icon: LayoutDashboard, label: "Painel", path: "/admin" },
    { icon: Store, label: "Restaurantes", path: "/admin/restaurants" },
    { icon: Coffee, label: "Produtos", path: "/admin/products" },
    { icon: List, label: "Categorias", path: "/admin/menu" },
    { icon: ShoppingCart, label: "Pedidos", path: "/admin/orders" },
    { icon: ShoppingCart, label: "PDV", path: "/admin/pdv" },
    {
      icon: Receipt,
      label: "Contas a Receber",
      path: "/admin/accounts-receivable",
    },
    {
      icon: DollarSign,
      label: "Contas a Pagar",
      path: "/admin/accounts-payable",
    },
    {
      icon: Settings,
      label: "Configurações de API",
      path: "/admin/api-settings",
    },
  ];

  const currentPage = menuItems.find(
    (item) =>
      location.pathname === item.path ||
      (item.path !== "/admin" && location.pathname.startsWith(item.path))
  );

  return (
    <div
      className={`sticky top-0 z-20 bg-white border-b transition-all duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between md:px-6">
        <div className="flex items-center gap-3">
          {!isMobile ? (
            <SidebarTrigger
              className={`h-10 w-10 border rounded-md transition-all bg-white hover:bg-gray-100 ${
                openMobile ? "bg-blue-100 border-blue-200" : "bg-gray-50"
              }`}
            >
              {openMobile ? (
                <ChevronLeft className="h-5 w-5 text-blue-600" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </SidebarTrigger>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 md:hidden bg-white hover:bg-gray-100 border"
              onClick={() => setOpenMobile(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-medium md:text-xl truncate">
            {currentPage?.label || "Painel Administrativo"}
          </h1>
        </div>

<<<<<<< HEAD
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center text-sm text-gray-600">
                <Store className="h-4 w-4 mr-1" />
                <span>{user?.businessName || "Restaurante"}</span>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {user?.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">
                        {user?.name || "Administrador"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Store className="h-4 w-4 mr-2" />
                      {user?.businessName || "Restaurante"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Perfil</DropdownMenuItem>
                    <DropdownMenuItem>Configurações</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
=======
        {/* Espaço para ações específicas de cada página */}
        <div className="flex items-center">
          {/* Conteúdo flexível para botões de ação específicos */}
        </div>
>>>>>>> parent of c1b20d4 (Implementar autenticação e proteção de rotas com contexto de autenticação)
      </div>
    </div>
  );
};

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
    { icon: ShoppingCart, label: "PDV", path: "/admin/pdv" },
    {
      icon: Receipt,
      label: "Contas a Receber",
      path: "/admin/accounts-receivable",
    },
    {
      icon: DollarSign,
      label: "Contas a Pagar",
      path: "/admin/accounts-payable",
    },
    {
      icon: Settings,
      label: "Configurações de API",
      path: "/admin/api-settings",
    },
  ];

  return (
    <SidebarProvider defaultOpen={window.innerWidth >= 1024}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar variant="floating" className="z-30">
          <SidebarHeader className="border-b p-4">
            <h2 className="text-lg font-semibold">Painel Administrativo</h2>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={
                      location.pathname === item.path ||
                      (item.path !== "/admin" &&
                        location.pathname.startsWith(item.path))
                        ? "default"
                        : "ghost"
                    }
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
        <main className="flex-1 flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
