
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface AddCashRegisterDialogProps {
  onSuccess: () => void;
}

const AddCashRegisterDialog = ({ onSuccess }: AddCashRegisterDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCashRegister, setNewCashRegister] = useState({
    name: "",
    initialAmount: "",
  });

  const createMutation = useMutation({
    mutationFn: async (newCashRegister: { name: string; initialAmount: number }) => {
      console.log("Iniciando criação de caixa:", newCashRegister);

      // Ensure we're using the correct case for the table name
      const { data, error } = await supabase
        .from("CashRegisters")
        .insert([
          {
            name: newCashRegister.name,
            initialAmount: newCashRegister.initialAmount,
            currentAmount: newCashRegister.initialAmount,
            status: "OPEN",
            restaurantId: DEFAULT_RESTAURANT_ID,
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
      onSuccess();
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

  return (
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
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCashRegisterDialog;
