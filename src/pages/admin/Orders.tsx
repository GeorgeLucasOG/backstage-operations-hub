import { useState, useEffect } from "react";
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
import { Plus, Check, Clock, Pencil, Trash, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  customerCpf: string | null;
  total: number;
  status: "PENDING" | "IN_PREPARATION" | "FINISHED";
  consumptionMethod: "TAKEAWAY" | "DINE_IN";
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

interface Restaurant {
  id: string;
  name: string;
}

interface OrderFormData {
  customerName: string;
  customerCpf: string;
  tableNumber: string; // Mantemos no formulário para referência, mas não enviamos ao banco
  total: string;
  consumptionMethod: "TAKEAWAY" | "DINE_IN";
  restaurantId: string;
}

const OrderForm = ({
  onSubmit,
  initialData = null,
  buttonText = "Criar Pedido",
  restaurants = [],
}: {
  onSubmit: (data: OrderFormData) => void;
  initialData?: Order | null;
  buttonText?: string;
  restaurants?: Restaurant[];
}) => {
  const getInitialFormData = (): OrderFormData => {
    if (initialData) {
      return {
        customerName: initialData.customerName,
        customerCpf: initialData.customerCpf || "",
        tableNumber: "", // A coluna não existe no banco, iniciamos vazia
        total: initialData.total.toString(),
        consumptionMethod: initialData.consumptionMethod,
        restaurantId: initialData.restaurantId,
      };
    }

    // Se temos restaurantes, use o primeiro como padrão
    const defaultRestaurantId =
      restaurants.length > 0 ? restaurants[0].id : DEFAULT_RESTAURANT_ID;

    return {
      customerName: "",
      customerCpf: "",
      tableNumber: "",
      total: "",
      consumptionMethod: "DINE_IN",
      restaurantId: defaultRestaurantId,
    };
  };

  const [formData, setFormData] = useState<OrderFormData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualizar o restaurante padrão quando a lista de restaurantes mudar
  useEffect(() => {
    if (restaurants.length > 0 && !formData.restaurantId) {
      setFormData((prev) => ({
        ...prev,
        restaurantId: restaurants[0].id,
      }));
    }
  }, [restaurants]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar os dados antes de enviar
    if (!formData.customerName.trim()) {
      alert("Nome do cliente é obrigatório");
      setIsSubmitting(false);
      return;
    }

    if (formData.consumptionMethod === "DINE_IN" && !formData.tableNumber) {
      alert("Número da mesa é obrigatório para consumo no local");
      setIsSubmitting(false);
      return;
    }

    if (
      !formData.total ||
      isNaN(parseFloat(formData.total)) ||
      parseFloat(formData.total) <= 0
    ) {
      alert("Informe um valor total válido");
      setIsSubmitting(false);
      return;
    }

    if (!formData.restaurantId) {
      alert("Selecione um restaurante");
      setIsSubmitting(false);
      return;
    }

    onSubmit(formData);
    setIsSubmitting(false);
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
        <Label htmlFor="customerCpf">CPF (opcional)</Label>
        <Input
          id="customerCpf"
          name="customerCpf"
          value={formData.customerCpf}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="restaurantId">Restaurante</Label>
        <select
          id="restaurantId"
          name="restaurantId"
          className="w-full p-2 border rounded"
          value={formData.restaurantId}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um restaurante</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
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
            required
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
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Processando..." : buttonText}
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Consultar restaurantes disponíveis
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

  // Obter mapa de nomes de restaurantes para exibição
  const restaurantMap = restaurants.reduce((acc, restaurant) => {
    acc[restaurant.id] = restaurant.name;
    return acc;
  }, {} as Record<string, string>);

  const createMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      console.log("Criando novo pedido com dados:", orderData);

      // Verificar se temos restaurantes disponíveis
      if (!restaurants || restaurants.length === 0) {
        throw new Error(
          "Nenhum restaurante disponível para associar ao pedido"
        );
      }

      // Verificar se o restauranteId é válido (existe na lista)
      const restaurantExists = restaurants.some(
        (r) => r.id === orderData.restaurantId
      );
      if (!restaurantExists) {
        throw new Error(
          `Restaurante com ID ${orderData.restaurantId} não encontrado`
        );
      }

      const now = new Date().toISOString();

      // IMPORTANTE: NÃO INCLUIR tableNumber no payload enviado ao banco
      // pois essa coluna não existe na tabela Order
      const data = {
        customerName: orderData.customerName,
        customerCpf: orderData.customerCpf || null, // Tornando CPF opcional
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

      // Verificar se o restauranteId é válido (existe na lista)
      const restaurantExists = restaurants.some(
        (r) => r.id === orderData.restaurantId
      );
      if (!restaurantExists) {
        throw new Error(
          `Restaurante com ID ${orderData.restaurantId} não encontrado`
        );
      }

      const now = new Date().toISOString();

      // IMPORTANTE: NÃO INCLUIR tableNumber no payload enviado ao banco
      // pois essa coluna não existe na tabela Order
      const data = {
        customerName: orderData.customerName,
        customerCpf: orderData.customerCpf || null, // Tornando CPF opcional
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

  // Função para lidar com a ação de editar
  const handleEdit = (order: Order) => {
    console.log("Editando pedido:", order);
    setEditingOrder(order);
    setIsEditOpen(true);
  };

  // Função para lidar com a ação de excluir
  const handleDelete = (id: number) => {
    setDeletingOrderId(id);
    setIsDeleteDialogOpen(true);
  };

  // Função para confirmar exclusão
  const confirmDelete = () => {
    if (deletingOrderId) {
      deleteMutation.mutate(deletingOrderId);
    }
  };

  const formatConsumption = (method: string) => {
    return method === "DINE_IN" ? "No Local" : "Para Viagem";
  };

  // Se houver um erro na consulta, mostrar mensagem
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

  // Verificar se há restaurantes disponíveis
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
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Novo Pedido</SheetTitle>
              <SheetDescription>
                Preencha os dados para criar um novo pedido
              </SheetDescription>
            </SheetHeader>
            {noRestaurants ? (
              <div className="mt-4 p-4 border border-red-200 rounded bg-red-50 text-red-700">
                <p>
                  Não há restaurantes cadastrados. Adicione pelo menos um
                  restaurante antes de criar pedidos.
                </p>
              </div>
            ) : (
              <OrderForm
                onSubmit={(data) => createMutation.mutate(data)}
                restaurants={restaurants}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet de Edição */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Pedido #{editingOrder?.id}</SheetTitle>
            <SheetDescription>
              Atualize os dados do pedido conforme necessário
            </SheetDescription>
          </SheetHeader>
          {editingOrder && (
            <OrderForm
              initialData={editingOrder}
              onSubmit={(data) =>
                updateMutation.mutate({
                  ...data,
                  id: editingOrder.id,
                })
              }
              buttonText="Atualizar Pedido"
              restaurants={restaurants}
            />
          )}
        </SheetContent>
      </Sheet>

      {isOrdersLoading || isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Carregando pedidos...</span>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Restaurante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Ações</TableHead>
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
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(order.total)}
                    </TableCell>
                    <TableCell>
                      {restaurantMap[order.restaurantId] || order.restaurantId}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{getStatusLabel(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {/* Botões de Status */}
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

                        {/* Botões de Edição e Exclusão */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(order)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
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
