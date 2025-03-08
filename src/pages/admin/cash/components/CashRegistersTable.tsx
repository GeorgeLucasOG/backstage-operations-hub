
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, XSquare } from "lucide-react";
import { CashRegister } from "../types";
import { formatCurrency, formatDate } from "../utils";

interface CashRegistersTableProps {
  cashRegisters: CashRegister[];
  isLoading: boolean;
  onViewDetails: (cashRegister: CashRegister) => void;
  onCloseCashRegister: (cashRegister: CashRegister) => void;
}

const CashRegistersTable = ({
  cashRegisters,
  isLoading,
  onViewDetails,
  onCloseCashRegister,
}: CashRegistersTableProps) => {
  if (isLoading) {
    return <div className="text-center py-4">Carregando caixas...</div>;
  }

  if (!cashRegisters || cashRegisters.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nenhum caixa encontrado. Use o botão acima para criar um novo caixa.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor Inicial</TableHead>
            <TableHead>Valor Atual</TableHead>
            <TableHead>Data de Abertura</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cashRegisters.map((cashRegister) => (
            <TableRow key={cashRegister.id}>
              <TableCell className="font-medium">{cashRegister.name}</TableCell>
              <TableCell>
                <Badge
                  variant={cashRegister.status === "OPEN" ? "default" : "destructive"}
                  className={cashRegister.status === "OPEN" ? "bg-green-500" : ""}
                >
                  {cashRegister.status === "OPEN" ? "Aberto" : "Fechado"}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(cashRegister.initialamount)}</TableCell>
              <TableCell>{formatCurrency(cashRegister.currentamount)}</TableCell>
              <TableCell>{formatDate(cashRegister.openedat)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(cashRegister)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                  {cashRegister.status === "OPEN" && (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CashRegistersTable;
