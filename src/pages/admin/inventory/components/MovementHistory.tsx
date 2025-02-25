
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { StockMovement, Ingredient } from "../types";

interface MovementHistoryProps {
  movements: StockMovement[] | undefined;
  ingredients: Ingredient[] | undefined;
}

export function MovementHistory({ movements, ingredients }: MovementHistoryProps) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Histórico de Movimentações</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Ingrediente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements?.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                {format(new Date(movement.created_at), "dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell>
                {ingredients?.find(i => i.id === movement.ingredient_id)?.name}
              </TableCell>
              <TableCell>{movement.type === "IN" ? "Entrada" : "Saída"}</TableCell>
              <TableCell>{movement.quantity}</TableCell>
              <TableCell>{movement.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
