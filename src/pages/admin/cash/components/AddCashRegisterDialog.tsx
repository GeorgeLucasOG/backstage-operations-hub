
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCashRegister } from "../services/cashService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddCashRegisterDialogProps {
  onSuccess?: () => void;
}

const AddCashRegisterDialog = ({ onSuccess }: AddCashRegisterDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [initialAmount, setInitialAmount] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error("O nome do caixa é obrigatório");
      }

      const amount = parseFloat(initialAmount);
      if (isNaN(amount) || amount < 0) {
        throw new Error("O valor inicial deve ser um número válido maior ou igual a zero");
      }

      return createCashRegister(name.trim(), amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
      toast({
        title: "Sucesso",
        description: "Caixa criado com sucesso!",
      });
      setOpen(false);
      setName("");
      setInitialAmount("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Caixa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Caixa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Caixa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Caixa Principal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialAmount">Valor Inicial (R$)</Label>
            <Input
              id="initialAmount"
              type="number"
              step="0.01"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Criar Caixa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCashRegisterDialog;
