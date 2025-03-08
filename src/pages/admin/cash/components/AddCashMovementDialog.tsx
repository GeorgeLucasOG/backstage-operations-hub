
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCashMovement } from "../services/cashService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CashRegister, PaymentMethod } from "../types";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface AddCashMovementDialogProps {
  cashRegister: CashRegister;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCashMovementDialog = ({
  cashRegister,
  isOpen,
  onOpenChange,
}: AddCashMovementDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMovement, setNewMovement] = useState({
    description: "",
    amount: "",
    type: "INCOME",
    paymentMethod: "CASH" as PaymentMethod,
  });

  const movementMutation = useMutation({
    mutationFn: async () => {
      if (!newMovement.description.trim()) {
        throw new Error("A descrição é obrigatória");
      }

      const amount = parseFloat(newMovement.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("O valor deve ser um número válido maior que zero");
      }

      return createCashMovement({
        description: newMovement.description.trim(),
        amount,
        type: newMovement.type as "INCOME" | "EXPENSE",
        paymentMethod: newMovement.paymentMethod,
        cashRegisterId: cashRegister.id,
        restaurantId: cashRegister.restaurantId,
        orderId: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
      queryClient.invalidateQueries({
        queryKey: ["cashMovements", cashRegister.id],
      });
      onOpenChange(false);
      setNewMovement({
        description: "",
        amount: "",
        type: "INCOME",
        paymentMethod: "CASH",
      });
      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao registrar movimentação",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewMovement((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMovement((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    movementMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Movimentação</DialogTitle>
          <DialogDescription>
            Registre uma entrada ou saída no caixa: {cashRegister.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimentação</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                className={`flex-1 ${
                  newMovement.type === "INCOME"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => handleSelectChange("type", "INCOME")}
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Entrada
              </Button>
              <Button
                type="button"
                className={`flex-1 ${
                  newMovement.type === "EXPENSE"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => handleSelectChange("type", "EXPENSE")}
              >
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Saída
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              value={newMovement.description}
              onChange={handleInputChange}
              placeholder="Descrição da movimentação"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={newMovement.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select
              value={newMovement.paymentMethod}
              onValueChange={(value) =>
                handleSelectChange("paymentMethod", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={movementMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={movementMutation.isPending}
              className={newMovement.type === "INCOME" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
            >
              {movementMutation.isPending
                ? "Registrando..."
                : "Registrar Movimentação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCashMovementDialog;
