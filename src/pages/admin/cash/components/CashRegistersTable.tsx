
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CashRegister } from "../types";
import { formatCurrency, formatDate } from "../utils";
import { Eye, XSquare } from "lucide-react";

interface CashRegistersTableProps {
  cashRegisters: CashRegister[];
  isLoading: boolean;
  onViewDetails: (cashRegister: CashRegister) => void;
  onCloseCashRegister?: (cashRegister: CashRegister) => void;
}

const CashRegistersTable = ({
  cashRegisters,
  isLoading,
  onViewDetails,
  onCloseCashRegister,
}: CashRegistersTableProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Valor Inicial</TableHead>
            <TableHead>Valor Atual</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Abertura</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cashRegisters && cashRegisters.length > 0 ? (
            cashRegisters.map((cashRegister) => (
              <TableRow key={cashRegister.id}>
                <TableCell>{cashRegister.name}</TableCell>
                <TableCell>{formatCurrency(cashRegister.initialAmount)}</TableCell>
                <TableCell>{formatCurrency(cashRegister.currentAmount)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={cashRegister.status === "OPEN" ? "default" : "destructive"}
                    className={cashRegister.status === "OPEN" ? "bg-green-500" : ""}
                  >
                    {cashRegister.status === "OPEN" ? "Aberto" : "Fechado"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(cashRegister.openedAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDetails(cashRegister)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    
                    {cashRegister.status === "OPEN" && onCloseCashRegister && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onCloseCashRegister(cashRegister)}
                      >
                        <XSquare className="h-4 w-4 mr-1" />
                        Fechar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Nenhum caixa encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CashRegistersTable;
