import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  ShoppingBag,
  Store,
  Utensils,
  FileText,
  DollarSign,
  CreditCard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
}

/**
 * Componente de barra lateral para navegação
 */
const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();

  // Lista de itens do menu
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/admin" },
    { icon: Store, label: "Restaurantes", path: "/admin/restaurants" },
    { icon: ShoppingBag, label: "Produtos", path: "/admin/products" },
    { icon: Utensils, label: "Cardápio", path: "/admin/menu" },
    { icon: FileText, label: "Pedidos", path: "/admin/orders" },
    {
      icon: CreditCard,
      label: "Contas a Receber",
      path: "/admin/accounts-receivable",
    },
    {
      icon: DollarSign,
      label: "Contas a Pagar",
      path: "/admin/accounts-payable",
    },
    { icon: FileText, label: "PDV", path: "/admin/pdv" },
    { icon: Settings, label: "Configurações API", path: "/admin/api-settings" },
  ];

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-white shadow-lg transition-transform duration-300 md:static",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Cabeçalho da barra lateral */}
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-bold">Admin Food</h2>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path));

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-2 text-left"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Sobreposição para fechar o menu em dispositivos móveis */}
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
