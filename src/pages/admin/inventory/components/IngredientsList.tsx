
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ingredient, Supplier } from "../types";
import { StockMovementSheet } from "./StockMovementSheet";

interface IngredientsListProps {
  ingredients: Ingredient[] | undefined;
  suppliers: Supplier[] | undefined;
  onMovement: () => void;
}

export function IngredientsList({ ingredients, suppliers, onMovement }: IngredientsListProps) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Ingredientes em Estoque</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead>Alerta</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients?.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell>{ingredient.name}</TableCell>
              <TableCell>{ingredient.quantity}</TableCell>
              <TableCell>{ingredient.unit}</TableCell>
              <TableCell>{ingredient.min_quantity}</TableCell>
              <TableCell>{ingredient.alert_threshold}</TableCell>
              <TableCell>
                {suppliers?.find(s => s.id === ingredient.supplier_id)?.name || "-"}
              </TableCell>
              <TableCell>
                <StockMovementSheet ingredient={ingredient} onSuccess={onMovement} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
