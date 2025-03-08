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
import { Eye, XSquare, AlertCircle } from "lucide-react";
import { CashRegister } from "../types";
import { formatCurrency, formatDate } from "../utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  // Log para debug
  console.log(
    `Renderizando tabela de caixas. Total: ${cashRegisters?.length || 0}`
  );

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!cashRegisters || cashRegisters.length === 0) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-center py-3 text-yellow-800">
          Nenhum caixa encontrado. Use o botão acima para criar um novo caixa.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor Inicial</TableHead>
            <TableHead>Valor Atual</TableHead>
            <TableHead>Data de Abertura</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cashRegisters.map((cashRegister) => (
            <TableRow key={cashRegister.id}>
              <TableCell className="font-medium">{cashRegister.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    cashRegister.status === "OPEN" ? "default" : "destructive"
                  }
                  className={
                    cashRegister.status === "OPEN" ? "bg-green-500" : ""
                  }
                >
                  {cashRegister.status === "OPEN" ? "Aberto" : "Fechado"}
                </Badge>
              </TableCell>
              <TableCell>
                {formatCurrency(cashRegister.initialamount)}
              </TableCell>
              <TableCell>
                {formatCurrency(cashRegister.currentamount)}
              </TableCell>
              <TableCell>{formatDate(cashRegister.openedat)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
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
