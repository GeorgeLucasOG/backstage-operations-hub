
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { OrderFormData } from "../types";

interface UseOrderMutationsProps {
  setIsCreateOpen: (open: boolean) => void;
  setIsEditOpen: (open: boolean) => void;
  setEditingOrder: (order: any | null) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setDeletingOrderId: (id: number | null) => void;
}

export const useOrderMutations = ({
  setIsCreateOpen,
  setIsEditOpen,
  setEditingOrder,
  setIsDeleteDialogOpen,
  setDeletingOrderId,
}: UseOrderMutationsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      console.log("Criando novo pedido com dados:", orderData);

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

  return {
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  };
};
