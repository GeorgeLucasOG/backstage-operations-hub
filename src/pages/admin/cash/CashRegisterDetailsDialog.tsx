import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CashMovementsTable from "./CashMovementsTable";
import { CashRegister, CashMovement } from "./types";
import { formatCurrency, formatDate } from "./utils";

interface CashRegisterDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCashRegister: CashRegister | null;
}

const CashRegisterDetailsDialog = ({
  isOpen,
  onOpenChange,
  selectedCashRegister,
}: CashRegisterDetailsDialogProps) => {
  const { data: cashMovements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ["cashMovements", selectedCashRegister?.id],
    queryFn: async () => {
      if (!selectedCashRegister) return [];
      
      // Ensure we're using the correct case for the table name
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

  if (!selectedCashRegister) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Caixa: {selectedCashRegister.name}</DialogTitle>
          <DialogDescription>
            Informações e movimentações do caixa.
          </DialogDescription>
        </DialogHeader>

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
                    variant={selectedCashRegister.status === "OPEN" ? "default" : "destructive"}
                    className={selectedCashRegister.status === "OPEN" ? "bg-green-500" : ""}
                  >
                    {selectedCashRegister.status === "OPEN" ? "Aberto" : "Fechado"}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="movements" className="mt-0">
            <CashMovementsTable 
              cashMovements={cashMovements || []} 
              isLoading={isLoadingMovements} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CashRegisterDetailsDialog;
