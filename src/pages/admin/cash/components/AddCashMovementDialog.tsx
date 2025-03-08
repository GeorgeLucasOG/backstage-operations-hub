import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCashMovement } from "../services/cashService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CashRegister, PaymentMethod } from "../types";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDownUp } from "lucide-react";

interface AddCashMovementDialogProps {
  cashRegister: CashRegister;
  onSuccess?: () => void;
}

const ADD_MOVEMENT_TYPES = [
  { value: "INCOME", label: "Entrada", color: "text-green-600" },
  { value: "EXPENSE", label: "Saída", color: "text-red-600" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Dinheiro" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "DEBIT_CARD", label: "Cartão de Débito" },
  { value: "PIX", label: "PIX" },
  { value: "OTHER", label: "Outro" },
];

const AddCashMovementDialog = ({
  cashRegister,
  onSuccess,
}: AddCashMovementDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!description.trim()) {
        throw new Error("A descrição é obrigatória");
      }

      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("O valor deve ser um número válido maior que zero");
      }

      return createCashMovement({
        description: description.trim(),
        amount: amountValue,
        type,
        paymentmethod: paymentMethod,
        cashregisterid: cashRegister.id,
        restaurantid: cashRegister.restaurantid,
        orderid: null,
      });
    },
    onSuccess: () => {
      // Atualizar cache
      queryClient.invalidateQueries({
        queryKey: ["cashMovements", cashRegister.id],
      });
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });

      // Mostrar toast de sucesso
      toast({
        title: "Sucesso",
        description: `Movimentação ${
          type === "INCOME" ? "de entrada" : "de saída"
        } registrada com sucesso!`,
      });

      // Resetar formulário
      setDescription("");
      setAmount("");

      // Fechar diálogo
      setOpen(false);

      // Executar callback
      if (onSuccess) {
        console.log("Executando callback após adicionar movimentação");
        setTimeout(() => {
          onSuccess();
        }, 300);
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        // Se o diálogo for fechado, podemos atualizar os dados
        if (!newOpen && onSuccess) {
          onSuccess();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <ArrowDownUp className="h-4 w-4 mr-2" />
          Registrar Movimentação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Movimentação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimentação</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as "INCOME" | "EXPENSE")}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {ADD_MOVEMENT_TYPES.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className={option.color}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={
                type === "INCOME" ? "border-green-500" : "border-red-500"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Selecione o método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a movimentação"
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? "Registrando..."
                : "Registrar Movimentação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCashMovementDialog;
