
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AddCashRegisterDialog from "./cash/AddCashRegisterDialog";
import CashRegistersTable from "./cash/CashRegistersTable";
import CashRegisterDetailsDialog from "./cash/CashRegisterDetailsDialog";
import { CashRegister } from "./cash/types";

const Cash = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);

  const { data: cashRegisters, isLoading, refetch } = useQuery({
    queryKey: ["cashRegisters"],
    queryFn: async () => {
      // Ensure we're using the correct case for the table name
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

  const handleViewDetails = (cashRegister: CashRegister) => {
    setSelectedCashRegister(cashRegister);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Caixas</h1>
        <AddCashRegisterDialog onSuccess={refetch} />
      </div>

      <CashRegistersTable
        cashRegisters={cashRegisters || []}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />

      <CashRegisterDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        selectedCashRegister={selectedCashRegister}
      />
    </div>
  );
};

export default Cash;
