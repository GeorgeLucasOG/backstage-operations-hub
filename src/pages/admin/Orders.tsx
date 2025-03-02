import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  supabase,
  DEFAULT_RESTAURANT_ID,
} from "@/integrations/supabase/client";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Função para gerar UUID v4
function generateUUID() {
  // Implementação simples de UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface Order {
  id: number;
  customerName: string;
  customerCpf: string;
  tableNumber?: number | null;
  total: number;
  status: "PENDING" | "IN_PREPARATION" | "FINISHED";
  consumptionMethod: "TAKEAWAY" | "DINE_IN";
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderFormData {
  customerName: string;
  customerCpf: string;
  tableNumber: string;
  total: string;
  consumptionMethod: "TAKEAWAY" | "DINE_IN";
  restaurantId: string;
}

const OrderForm = ({
  onSubmit,
}: {
  onSubmit: (data: OrderFormData) => void;
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    customerCpf: "",
    tableNumber: "",
    total: "",
    consumptionMethod: "DINE_IN",
    restaurantId: DEFAULT_RESTAURANT_ID,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
        <Label htmlFor="customerName">Nome do Cliente</Label>
        <Input
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerCpf">CPF</Label>
        <Input
          id="customerCpf"
          name="customerCpf"
          value={formData.customerCpf}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="consumptionMethod">Método de Consumo</Label>
        <select
          id="consumptionMethod"
          name="consumptionMethod"
          className="w-full p-2 border rounded"
          value={formData.consumptionMethod}
          onChange={handleChange}
          required
        >
          <option value="DINE_IN">No Local</option>
          <option value="TAKEAWAY">Para Viagem</option>
        </select>
      </div>
      {formData.consumptionMethod === "DINE_IN" && (
        <div className="space-y-2">
          <Label htmlFor="tableNumber">Número da Mesa</Label>
          <Input
            id="tableNumber"
            name="tableNumber"
            type="number"
            value={formData.tableNumber}
            onChange={handleChange}
            required={formData.consumptionMethod === "DINE_IN"}
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
      <Button type="submit" className="w-full">
        Criar Pedido
      </Button>
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
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Finalizado
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const Orders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("Consultando pedidos...");

      const { data, error } = await supabase
        .from("Order") // Corrigindo para PascalCase
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao consultar pedidos:", error);
        throw error;
      }

      console.log("Pedidos encontrados:", data);
      return data as Order[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      console.log("Criando novo pedido com dados:", orderData);

      // Se for para viagem, remover o número da mesa
      const tableNumber =
        orderData.consumptionMethod === "DINE_IN"
          ? parseInt(orderData.tableNumber)
          : null;

      const now = new Date().toISOString();
      const data = {
        customerName: orderData.customerName,
        customerCpf: orderData.customerCpf,
        tableNumber,
        total: parseFloat(orderData.total),
        status: "PENDING" as const,
        consumptionMethod: orderData.consumptionMethod,
        restaurantId: orderData.restaurantId,
        createdAt: now,
        updatedAt: now,
      };

      console.log("Payload para criação de pedido:", data);

      const { data: newOrder, error } = await supabase
        .from("Order") // Corrigindo para PascalCase
        .insert([data])
        .select();

      if (error) {
        console.error("Erro ao criar pedido:", error);
        throw error;
      }

      console.log("Pedido criado com sucesso:", newOrder);
      return newOrder[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
      const { error } = await supabase
        .from("Order") // Corrigindo para PascalCase
        .update({
          status,
          updatedAt: now,
        })
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar status:", error);
        throw error;
      }

      console.log("Status atualizado com sucesso");
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

  const formatConsumption = (method: string) => {
    return method === "DINE_IN" ? "No Local" : "Para Viagem";
  };

  // Se houver um erro na consulta, mostrar mensagem
  if (error) {
    console.error("Erro na consulta de pedidos:", error);
    return (
      <div className="py-8 rounded-lg border-red-200 border p-4 bg-red-50 text-red-700">
        <h2 className="text-lg font-semibold mb-2">Erro ao carregar pedidos</h2>
        <p>{error instanceof Error ? error.message : "Erro desconhecido"}</p>
      </div>
    );
  }

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
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {formatConsumption(order.consumptionMethod)}
                    </TableCell>
                    <TableCell>{order.tableNumber || "-"}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(order.total)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
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
