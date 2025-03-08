
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
import { Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define types here instead of importing from deleted inventory/types
interface CashRegister {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  status: string;
  restaurantId: string;
  openedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface CashMovement {
  id: string;
  description: string;
  amount: number;
  type: string;
  paymentMethod: string;
  cashRegisterId: string;
  restaurantId: string;
  orderId: number | null;
  createdAt: string;
  updatedAt: string | null;
}

const Cash = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCashRegister, setNewCashRegister] = useState({
    name: "",
    initialAmount: "",
  });

  const { data: cashRegisters, isLoading, refetch } = useQuery({
    queryKey: ["cashRegisters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("CashRegisters")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao consultar caixas:", error);
        throw new Error("Não foi possível carregar os caixas");
      }

      console.log("Dados de caixas obtidos:", data);
      return data as CashRegister[];
    },
  });

  const { data: cashMovements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ["cashMovements", selectedCashRegister?.id],
    queryFn: async () => {
      if (!selectedCashRegister) return [];
      
      const { data, error } = await supabase
        .from("CashMovements")
        .select("*")
        .eq("cashRegisterId", selectedCashRegister.id)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao consultar movimentos:", error);
        throw new Error("Não foi possível carregar os movimentos do caixa");
      }

      console.log("Movimentos de caixa obtidos:", data);
      return data as CashMovement[];
    },
    enabled: !!selectedCashRegister,
  });

  const createMutation = useMutation({
    mutationFn: async (newCashRegister: { name: string; initialAmount: number }) => {
      console.log("Iniciando criação de caixa:", newCashRegister);

      const { data, error } = await supabase
        .from("CashRegisters")
        .insert([
          {
            name: newCashRegister.name,
            initialAmount: newCashRegister.initialAmount,
            currentAmount: newCashRegister.initialAmount,
            status: "OPEN",
            restaurantId: "d2d5278d-8df1-4819-87a0-f23b519e3f2a", // Substitua pelo ID do restaurante atual
            openedAt: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Erro ao criar caixa:", error);
        throw new Error(`Erro ao criar caixa: ${error.message}`);
      }

      console.log("Caixa criado com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
      setIsOpen(false);
      setNewCashRegister({ name: "", initialAmount: "" });
      toast({
        title: "Sucesso",
        description: "Caixa criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na criação:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao criar caixa",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewCashRegister((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Iniciando adição de caixa com dados:", newCashRegister);

      if (!newCashRegister.name.trim()) {
        throw new Error("O nome do caixa é obrigatório");
      }

      if (
        !newCashRegister.initialAmount ||
        isNaN(parseFloat(newCashRegister.initialAmount))
      ) {
        throw new Error("O valor inicial deve ser um número válido");
      }

      await createMutation.mutateAsync({
        name: newCashRegister.name.trim(),
        initialAmount: parseFloat(newCashRegister.initialAmount) || 0,
      });

      refetch();
    } catch (error) {
      console.error("Erro ao adicionar caixa:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar o caixa",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const handleViewDetails = (cashRegister: CashRegister) => {
    setSelectedCashRegister(cashRegister);
    setIsDetailsOpen(true);
  };

  const getMovementTypeColor = (type: string): string => {
    return type === "INCOME" ? "text-green-600" : "text-red-600";
  };

  const getMovementTypeIcon = (type: string) => {
    return type === "INCOME" ? (
      <ArrowUpCircle className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Caixas</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Caixa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Caixa</DialogTitle>
              <DialogDescription>
                Preencha os campos para adicionar um novo caixa.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={newCashRegister.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialAmount">Valor Inicial (R$)</Label>
                <Input
                  id="initialAmount"
                  name="initialAmount"
                  type="number"
                  step="0.01"
                  value={newCashRegister.initialAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvar" : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Valor Inicial</TableHead>
                <TableHead>Valor Atual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashRegisters && cashRegisters.length > 0 ? (
                cashRegisters.map((cashRegister) => (
                  <TableRow key={cashRegister.id}>
                    <TableCell>{cashRegister.name}</TableCell>
                    <TableCell>{formatCurrency(cashRegister.initialAmount)}</TableCell>
                    <TableCell>{formatCurrency(cashRegister.currentAmount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={cashRegister.status === "OPEN" ? "success" : "destructive"}
                        className={cashRegister.status === "OPEN" ? "bg-green-500" : ""}
                      >
                        {cashRegister.status === "OPEN" ? "Aberto" : "Fechado"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(cashRegister.openedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(cashRegister)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhum caixa encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog para detalhes do caixa */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Caixa: {selectedCashRegister?.name}</DialogTitle>
            <DialogDescription>
              Informações e movimentações do caixa.
            </DialogDescription>
          </DialogHeader>

          {selectedCashRegister && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="movements">Movimentações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedCashRegister.initialAmount)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedCashRegister.currentAmount)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Data de Abertura</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-base">{formatDate(selectedCashRegister.openedAt)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge 
                        variant={selectedCashRegister.status === "OPEN" ? "success" : "destructive"}
                        className={selectedCashRegister.status === "OPEN" ? "bg-green-500" : ""}
                      >
                        {selectedCashRegister.status === "OPEN" ? "Aberto" : "Fechado"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="movements" className="mt-0">
                {isLoadingMovements ? (
                  <div className="text-center py-4">Carregando movimentações...</div>
                ) : cashMovements && cashMovements.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cashMovements.map((movement) => (
                          <TableRow key={movement.id}>
                            <TableCell className="flex items-center">
                              {getMovementTypeIcon(movement.type)}
                              <span className={`ml-2 ${getMovementTypeColor(movement.type)}`}>
                                {movement.type === "INCOME" ? "Entrada" : "Saída"}
                              </span>
                            </TableCell>
                            <TableCell>{movement.description}</TableCell>
                            <TableCell className={getMovementTypeColor(movement.type)}>
                              {movement.type === "INCOME" ? "+" : "-"}{formatCurrency(movement.amount)}
                            </TableCell>
                            <TableCell>{movement.paymentMethod}</TableCell>
                            <TableCell>{formatDate(movement.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhuma movimentação encontrada para este caixa.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cash;
