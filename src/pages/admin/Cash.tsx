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
import { Plus } from "lucide-react";
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
                    <TableCell>{cashRegister.status}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum caixa encontrado
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

export default Cash;
