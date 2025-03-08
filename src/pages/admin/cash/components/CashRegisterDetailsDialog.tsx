import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CashRegister, CashMovement } from "../types";
import { fetchCashMovements, closeCashRegister } from "../services/cashService";
import CashMovementsTable from "./CashMovementsTable";
import AddCashMovementDialog from "./AddCashMovementDialog";
import { formatCurrency, formatDate } from "../utils";
import { useToast } from "@/hooks/use-toast";

interface CashRegisterDetailsDialogProps {
  cashRegister: CashRegister;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCashRegisterClosed?: () => void;
}

const CashRegisterDetailsDialog = ({
  cashRegister,
  open,
  onOpenChange,
  onCashRegisterClosed,
}: CashRegisterDetailsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");

  // Buscar movimentações do caixa
  const {
    data: cashMovements = [],
    isLoading: isLoadingMovements,
    refetch: refetchMovements,
  } = useQuery({
    queryKey: ["cashMovements", cashRegister?.id],
    queryFn: () => fetchCashMovements(cashRegister.id),
    enabled: !!cashRegister?.id && open,
  });

  // Fechar caixa
  const closeMutation = useMutation({
    mutationFn: () => closeCashRegister(cashRegister.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });

      toast({
        title: "Sucesso",
        description: "Caixa fechado com sucesso!",
      });

      onOpenChange(false);

      if (onCashRegisterClosed) {
        onCashRegisterClosed();
      }
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao fechar caixa",
        variant: "destructive",
      });
    },
  });

  // Calcular totais
  const totalIncome = cashMovements
    .filter((movement) => movement.type === "INCOME")
    .reduce((acc, movement) => acc + movement.amount, 0);

  const totalExpense = cashMovements
    .filter((movement) => movement.type === "EXPENSE")
    .reduce((acc, movement) => acc + movement.amount, 0);

  const handleCloseCashRegister = () => {
    if (
      window.confirm(
        `Tem certeza que deseja fechar o caixa "${cashRegister.name}"?`
      )
    ) {
      closeMutation.mutate();
    }
  };

  const handleMovementAdded = () => {
    refetchMovements();
    queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Caixa: {cashRegister?.name}{" "}
            <span
              className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${
                cashRegister?.status === "OPEN"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {cashRegister?.status === "OPEN" ? "Aberto" : "Fechado"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="movements">
              Movimentações ({cashMovements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Valor Inicial</p>
                <p className="text-lg font-bold">
                  {formatCurrency(cashRegister?.initialamount)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Saldo Atual</p>
                <p className="text-lg font-bold">
                  {formatCurrency(cashRegister?.currentamount)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Entradas</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Saídas</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Data de Abertura</p>
                <p>{formatDate(cashRegister?.openedat)}</p>
              </div>
              {cashRegister?.closedat && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Data de Fechamento</p>
                  <p>{formatDate(cashRegister?.closedat)}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              {cashRegister?.status === "OPEN" && (
                <Button
                  variant="destructive"
                  onClick={handleCloseCashRegister}
                  disabled={closeMutation.isPending}
                >
                  {closeMutation.isPending
                    ? "Fechando Caixa..."
                    : "Fechar Caixa"}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            {cashRegister?.status === "OPEN" && (
              <div className="flex justify-end mb-4">
                <AddCashMovementDialog
                  cashRegister={cashRegister}
                  onSuccess={handleMovementAdded}
                />
              </div>
            )}

            <CashMovementsTable
              cashMovements={cashMovements}
              isLoading={isLoadingMovements}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CashRegisterDetailsDialog;
