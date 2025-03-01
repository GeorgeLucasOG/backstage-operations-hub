
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Order {
  id: number;
  customer_name: string;
  customer_cpf: string;
  total: number;
  table_number: number | null;
  status: "PENDING" | "IN_PREPARATION" | "FINISHED";
  consumption_method: "TAKEAWAY" | "DINE_IN";
  restaurant_id: string;
  created_at: string;
  Restaurant: {
    name: string;
  };
}

interface OrderFormData {
  customer_name: string;
  customer_cpf: string;
  total: number;
  table_number?: number;
  status: "PENDING" | "IN_PREPARATION" | "FINISHED";
  consumption_method: "TAKEAWAY" | "DINE_IN";
  restaurant_id: string;
}

interface Restaurant {
  id: string;
  name: string;
}

const OrderForm = ({ onSubmit, initialData = null, restaurants }: {
  onSubmit: (data: OrderFormData) => void,
  initialData?: Order | null,
  restaurants: Restaurant[]
}) => {
  const [formData, setFormData] = useState<OrderFormData>(
    initialData || {
      customer_name: "",
      customer_cpf: "",
      total: 0,
      table_number: undefined,
      status: "PENDING",
      consumption_method: "DINE_IN",
      restaurant_id: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customer_name" className="block text-sm font-medium mb-1">Nome do Cliente</label>
        <Input
          id="customer_name"
          value={formData.customer_name}
          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="customer_cpf" className="block text-sm font-medium mb-1">CPF do Cliente</label>
        <Input
          id="customer_cpf"
          value={formData.customer_cpf}
          onChange={(e) => setFormData({ ...formData, customer_cpf: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="total" className="block text-sm font-medium mb-1">Total</label>
        <Input
          id="total"
          type="number"
          step="0.01"
          value={formData.total}
          onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) })}
          required
        />
      </div>
      <div>
        <label htmlFor="consumption_method" className="block text-sm font-medium mb-1">Método de Consumo</label>
        <Select
          value={formData.consumption_method}
          onValueChange={(value: "TAKEAWAY" | "DINE_IN") => {
            setFormData({ 
              ...formData, 
              consumption_method: value,
              table_number: value === "TAKEAWAY" ? undefined : formData.table_number 
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o método de consumo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DINE_IN">Consumo no Local</SelectItem>
            <SelectItem value="TAKEAWAY">Para Viagem</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.consumption_method === "DINE_IN" && (
        <div>
          <label htmlFor="table_number" className="block text-sm font-medium mb-1">Número da Mesa</label>
          <Input
            id="table_number"
            type="number"
            value={formData.table_number || ""}
            onChange={(e) => setFormData({ ...formData, table_number: parseInt(e.target.value) })}
            required
          />
        </div>
      )}
      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value: "PENDING" | "IN_PREPARATION" | "FINISHED") => 
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="IN_PREPARATION">Em Preparação</SelectItem>
            <SelectItem value="FINISHED">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="restaurant" className="block text-sm font-medium mb-1">Restaurante</label>
        <Select
          value={formData.restaurant_id}
          onValueChange={(value) => setFormData({ ...formData, restaurant_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um restaurante" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        {initialData ? "Atualizar" : "Criar"} Pedido
      </Button>
    </form>
  );
};

const Orders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, Restaurant(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Restaurant")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data as Restaurant[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newOrder: OrderFormData) => {
      const { data, error } = await supabase
        .from("orders")
        .insert([newOrder])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Sucesso",
        description: "Pedido criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar pedido: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: OrderFormData & { id: number }) => {
      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setEditingOrder(null);
      toast({
        title: "Sucesso",
        description: "Pedido atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar pedido: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Sucesso",
        description: "Pedido excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir pedido: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatStatus = (status: Order["status"]) => {
    const statusMap = {
      PENDING: "Pendente",
      IN_PREPARATION: "Em Preparação",
      FINISHED: "Finalizado"
    };
    return statusMap[status];
  };

  const formatConsumptionMethod = (method: Order["consumption_method"]) => {
    const methodMap = {
      TAKEAWAY: "Para Viagem",
      DINE_IN: "Consumo no Local"
    };
    return methodMap[method];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Novo Pedido</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Novo Pedido</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {restaurants && (
                <OrderForm
                  onSubmit={(data) => createMutation.mutate(data)}
                  restaurants={restaurants}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoadingOrders ? (
        <div>Carregando...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Restaurante</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Consumo</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.Restaurant?.name}</TableCell>
                  <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                  <TableCell>{formatConsumptionMethod(order.consumption_method)}</TableCell>
                  <TableCell>{order.table_number || "-"}</TableCell>
                  <TableCell>{formatStatus(order.status)}</TableCell>
                  <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingOrder(order)}
                          >
                            Editar
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Editar Pedido</SheetTitle>
                          </SheetHeader>
                          <div className="mt-4">
                            {restaurants && (
                              <OrderForm
                                initialData={order}
                                onSubmit={(data) =>
                                  updateMutation.mutate({ ...data, id: order.id })
                                }
                                restaurants={restaurants}
                              />
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Orders;
