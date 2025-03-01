
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Check, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: number;
  customer_name: string;
  customer_cpf: string;
  table_number: number | null;
  total: number;
  status: "PENDING" | "IN_PREPARATION" | "FINISHED";
  consumption_method: "TAKEAWAY" | "DINE_IN";
  restaurant_id: string;
  created_at: string;
  updated_at?: string;
}

interface OrderFormData {
  customer_name: string;
  customer_cpf: string;
  table_number: string;
  total: string;
  consumption_method: "TAKEAWAY" | "DINE_IN";
  restaurant_id: string;
}

const OrderForm = ({ onSubmit }: { onSubmit: (data: OrderFormData) => void }) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: "",
    customer_cpf: "",
    table_number: "",
    total: "",
    consumption_method: "DINE_IN",
    restaurant_id: DEFAULT_RESTAURANT_ID,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="customer_name">Nome do Cliente</Label>
        <Input
          id="customer_name"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer_cpf">CPF</Label>
        <Input
          id="customer_cpf"
          name="customer_cpf"
          value={formData.customer_cpf}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="consumption_method">Método de Consumo</Label>
        <select
          id="consumption_method"
          name="consumption_method"
          className="w-full p-2 border rounded"
          value={formData.consumption_method}
          onChange={handleChange}
          required
        >
          <option value="DINE_IN">No Local</option>
          <option value="TAKEAWAY">Para Viagem</option>
        </select>
      </div>
      {formData.consumption_method === "DINE_IN" && (
        <div className="space-y-2">
          <Label htmlFor="table_number">Número da Mesa</Label>
          <Input
            id="table_number"
            name="table_number"
            type="number"
            value={formData.table_number}
            onChange={handleChange}
            required={formData.consumption_method === "DINE_IN"}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="total">Valor Total</Label>
        <Input
          id="total"
          name="total"
          type="number"
          step="0.01"
          value={formData.total}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" className="w-full">Criar Pedido</Button>
    </form>
  );
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">Pendente</Badge>;
    case "IN_PREPARATION":
      return <Badge variant="secondary">Em Preparação</Badge>;
    case "FINISHED":
      return <Badge variant="success">Finalizado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const Orders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      // Se for para viagem, remover o número da mesa
      const data = {
        ...orderData,
        table_number: orderData.consumption_method === "DINE_IN" 
          ? parseInt(orderData.table_number) 
          : null,
        total: parseFloat(orderData.total),
        status: "PENDING" as const,
      };

      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return newOrder;
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status: " + error.message,
        variant: "destructive",
      });
    },
  });

  const formatConsumption = (method: string) => {
    return method === "DINE_IN" ? "No Local" : "Para Viagem";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Novo Pedido</SheetTitle>
            </SheetHeader>
            <OrderForm onSubmit={(data) => createMutation.mutate(data)} />
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{formatConsumption(order.consumption_method)}</TableCell>
                    <TableCell>{order.table_number || "-"}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(order.total)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{getStatusLabel(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {order.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: order.id,
                                status: "IN_PREPARATION",
                              })
                            }
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Preparando
                          </Button>
                        )}
                        {order.status === "IN_PREPARATION" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: order.id,
                                status: "FINISHED",
                              })
                            }
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Finalizar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Orders;
