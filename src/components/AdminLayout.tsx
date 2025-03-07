import {
  Home,
  Store,
  LayoutList,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowDown,
  ArrowUp,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/auth/signOut";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const session = useSession();

  // Update the sidebar navigation items to include the API Settings
  const navigation = [
    {
      id: 'general',
      items: [
        { name: 'Dashboard', href: '/admin', icon: Home },
        { name: 'Restaurantes', href: '/admin/restaurant', icon: Store },
        { name: 'Categorias', href: '/admin/categories', icon: LayoutList },
        { name: 'Produtos', href: '/admin/products', icon: Package },
        { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
      ],
    },
    {
      id: 'financial',
      items: [
        { name: 'Caixa', href: '/admin/cash', icon: DollarSign },
        { name: 'Contas a Pagar', href: '/admin/accounts-payable', icon: ArrowDown },
        { name: 'Contas a Receber', href: '/admin/accounts-receivable', icon: ArrowUp },
      ],
    },
    {
      id: 'settings',
      items: [
        { name: 'Configurações de APIs', href: '/admin/api-settings', icon: Settings },
      ],
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="text-xl">
          <SidebarTrigger />
          Admin Panel
        </SidebarHeader>
        <SidebarContent>
          {navigation.map((section) => (
            <SidebarGroup key={section.id}>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuButton
                    key={item.name}
                    href={item.href}
                    isActive={pathname === item.href}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
              <SidebarSeparator />
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 w-full justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.data?.user?.image || ""} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span>{session.data?.user?.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {session.data?.user?.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                }}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
