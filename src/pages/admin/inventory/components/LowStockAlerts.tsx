
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Ingredient } from "../types";

interface LowStockAlertsProps {
  ingredients: Ingredient[] | undefined;
}

export function LowStockAlerts({ ingredients }: LowStockAlertsProps) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Alertas de Estoque Baixo</h2>
      <div className="space-y-2">
        {ingredients?.filter(i => i.quantity <= i.alert_threshold).map(ingredient => (
          <div
            key={ingredient.id}
            className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>
              {ingredient.name} está com estoque baixo ({ingredient.quantity} {ingredient.unit})
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
