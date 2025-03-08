
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCashRegister } from "../services/cashService";
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
  onSuccess?: () => void;
}

const AddCashRegisterDialog = ({ onSuccess }: AddCashRegisterDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newCashRegister, setNewCashRegister] = useState({
    name: "",
    initialAmount: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newCashRegister.name.trim()) {
        throw new Error("O nome do caixa é obrigatório");
      }

      const initialAmount = parseFloat(newCashRegister.initialAmount);
      if (isNaN(initialAmount)) {
        throw new Error("O valor inicial deve ser um número válido");
      }

      return createCashRegister(
        newCashRegister.name.trim(),
        initialAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
      setIsOpen(false);
      setNewCashRegister({ name: "", initialAmount: "" });
      toast({
        title: "Sucesso",
        description: "Caixa criado com sucesso!",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao criar caixa",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewCashRegister((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
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
              placeholder="Nome do caixa"
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
              placeholder="0.00"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCashRegisterDialog;
