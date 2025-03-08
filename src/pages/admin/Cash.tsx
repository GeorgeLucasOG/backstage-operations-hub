
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCashRegisters, closeCashRegister } from "./cash/services/cashService";
import { CashRegister } from "./cash/types";
import AddCashRegisterDialog from "./cash/components/AddCashRegisterDialog";
import CashRegistersTable from "./cash/components/CashRegistersTable";
import CashRegisterDetailsDialog from "./cash/components/CashRegisterDetailsDialog";
import { useToast } from "@/hooks/use-toast";

const Cash = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);

  const { data: cashRegisters, isLoading } = useQuery({
    queryKey: ["cashRegisters"],
    queryFn: fetchCashRegisters,
  });

  const closeMutation = useMutation({
    mutationFn: async (id: string) => {
      return closeCashRegister(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
      toast({
        title: "Sucesso",
        description: "Caixa fechado com sucesso!",
      });
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

  const handleViewDetails = (cashRegister: CashRegister) => {
    setSelectedCashRegister(cashRegister);
    setIsDetailsOpen(true);
  };

  const handleCloseCashRegister = (cashRegister: CashRegister) => {
    if (window.confirm(`Tem certeza que deseja fechar o caixa "${cashRegister.name}"?`)) {
      closeMutation.mutate(cashRegister.id);
    }
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Caixas</h1>
        <AddCashRegisterDialog onSuccess={handleRefreshData} />
      </div>

      <CashRegistersTable
        cashRegisters={cashRegisters || []}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onCloseCashRegister={handleCloseCashRegister}
      />

      <CashRegisterDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        selectedCashRegister={selectedCashRegister}
        onCashRegisterClosed={handleRefreshData}
      />
    </div>
  );
};

export default Cash;
