
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { CashMovement } from "../types";
import { formatCurrency, formatDate, getPaymentMethodLabel } from "../utils";

interface CashMovementsTableProps {
  cashMovements: CashMovement[];
  isLoading: boolean;
}

const CashMovementsTable = ({ cashMovements, isLoading }: CashMovementsTableProps) => {
  const getMovementTypeColor = (type: string): string => {
    return type === "INCOME" ? "text-green-600" : "text-red-600";
  };

  const getMovementTypeIcon = (type: string) => {
    return type === "INCOME" ? (
      <ArrowUpCircle className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownCircle className="h-4 w-4 text-red-600" />
    );
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando movimentações...</div>;
  }

  if (!cashMovements || cashMovements.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nenhuma movimentação encontrada para este caixa.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cashMovements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="flex items-center">
                {getMovementTypeIcon(movement.type)}
                <span className={`ml-2 ${getMovementTypeColor(movement.type)}`}>
                  {movement.type === "INCOME" ? "Entrada" : "Saída"}
                </span>
              </TableCell>
              <TableCell>{movement.description}</TableCell>
              <TableCell className={getMovementTypeColor(movement.type)}>
                {movement.type === "INCOME" ? "+" : "-"}{formatCurrency(movement.amount)}
              </TableCell>
              <TableCell>{getPaymentMethodLabel(movement.paymentmethod)}</TableCell>
              <TableCell>{formatDate(movement.createdat)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CashMovementsTable;
