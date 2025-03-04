
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

import { Order, Restaurant, OrderFormData } from "./orders/types";
import { OrdersTable } from "./orders/components/OrdersTable";
import { DeleteOrderDialog } from "./orders/components/DeleteOrderDialog";
import { OrderSheets } from "./orders/components/OrderSheets";

const Orders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const createMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      console.log("Criando novo pedido com dados:", orderData);

      if (!restaurants || restaurants.length === 0) {
        throw new Error(
          "Nenhum restaurante disponível para associar ao pedido"
        );
      }

      const restaurantExists = restaurants.some(
        (r) => r.id === orderData.restaurantId
      );
      if (!restaurantExists) {
        throw new Error(
          `Restaurante com ID ${orderData.restaurantId} não encontrado`
        );
      }

      const now = new Date().toISOString();

      const data = {
        customerName: orderData.customerName,
        customerCpf: orderData.customerCpf || null,
        total: parseFloat(orderData.total),
        status: "PENDING" as const,
        consumptionMethod: orderData.consumptionMethod,
        restaurantId: orderData.restaurantId,
        createdAt: now,
        updatedAt: now,
      };

      console.log("Payload para criação de pedido:", data);

      try {
        const { data: newOrder, error } = await supabase
          .from("Order")
          .insert([data])
          .select();

        if (error) {
          console.error("Erro ao criar pedido:", error);
          throw new Error(error.message || "Erro ao criar pedido");
        }

        if (!newOrder || newOrder.length === 0) {
          throw new Error("Pedido não foi criado corretamente");
        }

        console.log("Pedido criado com sucesso:", newOrder);
        return newOrder[0];
      } catch (error) {
        console.error("Erro detalhado na criação:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsCreateOpen(false);
      toast({
        title: "Sucesso",
        description: "Pedido criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro detalhado:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao criar pedido: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (orderData: OrderFormData & { id: number }) => {
      console.log("Atualizando pedido:", orderData);

      const restaurantExists = restaurants.some(
        (r) => r.id === orderData.restaurantId
      );
      if (!restaurantExists) {
        throw new Error(
          `Restaurante com ID ${orderData.restaurantId} não encontrado`
        );
      }

      const now = new Date().toISOString();

      const data = {
        customerName: orderData.customerName,
        customerCpf: orderData.customerCpf || null,
        total: parseFloat(orderData.total),
        consumptionMethod: orderData.consumptionMethod,
        restaurantId: orderData.restaurantId,
        updatedAt: now,
      };

      console.log(`Atualizando pedido ${orderData.id} com dados:`, data);

      try {
        const { data: updatedOrder, error } = await supabase
          .from("Order")
          .update(data)
          .eq("id", orderData.id)
          .select();

        if (error) {
          console.error("Erro ao atualizar pedido:", error);
          throw new Error(error.message || "Erro ao atualizar pedido");
        }

        console.log("Pedido atualizado com sucesso:", updatedOrder);
        return updatedOrder[0];
      } catch (error) {
        console.error("Erro detalhado na atualização:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsEditOpen(false);
      setEditingOrder(null);
      toast({
        title: "Sucesso",
        description: "Pedido atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro detalhado:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao atualizar pedido: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "PENDING" | "IN_PREPARATION" | "FINISHED";
    }) => {
      console.log(`Atualizando status do pedido ${id} para ${status}`);

      const now = new Date().toISOString();

      try {
        const { error } = await supabase
          .from("Order")
          .update({
            status,
            updatedAt: now,
          })
          .eq("id", id);

        if (error) {
          console.error("Erro ao atualizar status:", error);
          throw new Error(error.message || "Erro ao atualizar status");
        }

        console.log("Status atualizado com sucesso");
      } catch (error) {
        console.error("Erro detalhado na atualização de status:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado!",
      });
    },
    onError: (error) => {
      console.error("Erro detalhado:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao atualizar status: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Excluindo pedido ${id}`);

      try {
        const { error } = await supabase.from("Order").delete().eq("id", id);

        if (error) {
          console.error("Erro ao excluir pedido:", error);
          throw new Error(error.message || "Erro ao excluir pedido");
        }

        console.log("Pedido excluído com sucesso");
      } catch (error) {
        console.error("Erro detalhado na exclusão:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsDeleteDialogOpen(false);
      setDeletingOrderId(null);
      toast({
        title: "Sucesso",
        description: "Pedido excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro detalhado:", error);
      toast({
        title: "Erro",
        description:
          "Erro ao excluir pedido: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
      });
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
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button disabled={noRestaurants}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </SheetTrigger>
        </Sheet>
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
