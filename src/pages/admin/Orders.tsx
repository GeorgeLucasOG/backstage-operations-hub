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
import {
  Plus,
  Check,
  Clock,
  Pencil,
  Trash,
  AlertCircle,
  Menu,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se estamos em um dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

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

  // Renderização para desktop e mobile
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-white py-2 px-4 border-b mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold">Pedidos</h1>
        </div>
        <div className="flex gap-2 ml-auto">
          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <Button disabled={noRestaurants} className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Novo Pedido</span>
                <span className="sm:hidden">Novo</span>
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

      {/* Status de carregamento */}
      {isOrdersLoading && (
        <div className="py-8 text-center">
          <p className="text-gray-500">Carregando pedidos...</p>
        </div>
      )}

      {/* Mensagem se não houver pedidos */}
      {!isOrdersLoading && orders && orders.length === 0 && (
        <div className="py-8 text-center border rounded-lg">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
          <h2 className="mt-2 text-xl font-medium">Nenhum pedido encontrado</h2>
          <p className="text-gray-500 mt-1">
            Crie um novo pedido usando o botão acima.
          </p>
        </div>
      )}

      {/* Visualização para Desktop */}
      {!isOrdersLoading && orders && orders.length > 0 && !isMobile && (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Consumo</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2">
                      {getStatusLabel(order.status)}
                      {order.status !== "FINISHED" && (
                        <div className="flex items-center gap-1">
                          {order.status === "PENDING" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: order.id,
                                  status: "IN_PREPARATION",
                                })
                              }
                              title="Marcar Em Preparação"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === "IN_PREPARATION" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: order.id,
                                  status: "FINISHED",
                                })
                              }
                              title="Marcar como Finalizado"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatConsumption(order.consumptionMethod)}
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleEdit(order)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Visualização para Mobile (Cards) */}
      {!isOrdersLoading && orders && orders.length > 0 && isMobile && (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden border bg-white hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      #{order.id} - {order.customerName}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  {getStatusLabel(order.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-sm font-medium">Consumo</p>
                    <p className="text-sm">
                      {formatConsumption(order.consumptionMethod)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    {order.status !== "FINISHED" && (
                      <>
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
                            className="h-8"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Preparar
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
                            className="h-8"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Finalizar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(order)}
                      className="h-8"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
