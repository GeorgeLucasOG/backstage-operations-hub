
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCashMovements, closeCashRegister } from "../services/cashService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashRegister } from "../types";
import { formatCurrency, formatDate } from "../utils";
import CashMovementsTable from "./CashMovementsTable";
import AddCashMovementDialog from "./AddCashMovementDialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownUp, XSquare } from "lucide-react";

interface CashRegisterDetailsDialogProps {
  selectedCashRegister: CashRegister | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCashRegisterClosed?: () => void;
}

const CashRegisterDetailsDialog = ({
  selectedCashRegister,
  isOpen,
  onOpenChange,
  onCashRegisterClosed,
}: CashRegisterDetailsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);

  const { data: cashMovements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ["cashMovements", selectedCashRegister?.id],
    queryFn: () => {
      if (!selectedCashRegister) return [];
      return fetchCashMovements(selectedCashRegister.id);
    },
    enabled: !!selectedCashRegister && isOpen,
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCashRegister) {
        throw new Error("Nenhum caixa selecionado");
      }
      return closeCashRegister(selectedCashRegister.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
      toast({
        title: "Sucesso",
        description: "Caixa fechado com sucesso!",
      });
      onOpenChange(false);
      onCashRegisterClosed?.();
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

  const handleCloseCashRegister = () => {
    if (window.confirm("Tem certeza que deseja fechar este caixa?")) {
      closeMutation.mutate();
    }
  };

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
            
            {selectedCashRegister.status === "OPEN" && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddMovementOpen(true)}
                >
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  Registrar Movimentação
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCloseCashRegister}
                  disabled={closeMutation.isPending}
                >
                  <XSquare className="h-4 w-4 mr-2" />
                  {closeMutation.isPending ? "Fechando..." : "Fechar Caixa"}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="movements" className="mt-0">
            <div className="space-y-4">
              {selectedCashRegister.status === "OPEN" && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setIsAddMovementOpen(true)}
                  >
                    <ArrowDownUp className="h-4 w-4 mr-2" />
                    Registrar Movimentação
                  </Button>
                </div>
              )}
              
              <CashMovementsTable 
                cashMovements={cashMovements || []} 
                isLoading={isLoadingMovements} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {selectedCashRegister && (
        <AddCashMovementDialog
          cashRegister={selectedCashRegister}
          isOpen={isAddMovementOpen}
          onOpenChange={setIsAddMovementOpen}
        />
      )}
    </Dialog>
  );
};

export default CashRegisterDetailsDialog;
