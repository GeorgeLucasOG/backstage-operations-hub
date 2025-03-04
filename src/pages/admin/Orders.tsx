
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

import { Order, Restaurant } from "./orders/types";
import { OrdersTable } from "./orders/components/OrdersTable";
import { DeleteOrderDialog } from "./orders/components/DeleteOrderDialog";
import { OrderSheets } from "./orders/components/OrderSheets";
import { useOrderMutations } from "./orders/hooks/useOrderMutations";

const Orders = () => {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  } = useOrderMutations({
    setIsCreateOpen,
    setIsEditOpen,
    setEditingOrder,
    setIsDeleteDialogOpen,
    setDeletingOrderId,
  });

  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      console.log("Consultando restaurantes...");
      const { data, error } = await supabase
        .from("Restaurant")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Erro ao consultar restaurantes:", error);
        throw error;
      }

      console.log("Restaurantes encontrados:", data);
      return data as Restaurant[];
    },
  });

  const {
    data: orders,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("Consultando pedidos...");
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("Order")
          .select("*")
          .order("createdAt", { ascending: false });

        if (error) {
          console.error("Erro ao consultar pedidos:", error);
          throw error;
        }

        console.log("Pedidos encontrados:", data);
        return data as Order[];
      } catch (error) {
        console.error("Erro na consulta:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleEdit = (order: Order) => {
    console.log("Editando pedido:", order);
    setEditingOrder(order);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingOrderId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingOrderId) {
      deleteMutation.mutate(deletingOrderId);
    }
  };

  if (ordersError) {
    console.error("Erro na consulta de pedidos:", ordersError);
    return (
      <div className="py-8 rounded-lg border-red-200 border p-4 bg-red-50 text-red-700">
        <h2 className="text-lg font-semibold mb-2">Erro ao carregar pedidos</h2>
        <p>
          {ordersError instanceof Error
            ? ordersError.message
            : "Erro desconhecido"}
        </p>
      </div>
    );
  }

  const noRestaurants =
    !isLoadingRestaurants && (!restaurants || restaurants.length === 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <SheetTrigger asChild>
          <Button disabled={noRestaurants}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </SheetTrigger>
      </div>

      <DeleteOrderDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />

      <OrderSheets 
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        editingOrder={editingOrder}
        restaurants={restaurants}
        onCreateSubmit={(data) => createMutation.mutate(data)}
        onUpdateSubmit={(data) => updateMutation.mutate(data)}
        noRestaurants={noRestaurants}
      />

      <OrdersTable
        orders={orders || []}
        restaurants={restaurants}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusUpdate={(id, status) => 
          updateStatusMutation.mutate({ id, status })
        }
        isLoading={isOrdersLoading || isLoading}
      />
    </div>
  );
};

export default Orders;
