
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Ingredient } from "../types";

interface StockMovementSheetProps {
  ingredient: Ingredient;
  onSuccess: () => void;
}

export function StockMovementSheet({ ingredient, onSuccess }: StockMovementSheetProps) {
  const { toast } = useToast();
  const [movementData, setMovementData] = useState({
    ingredient_id: "",
    type: "IN" as "IN" | "OUT",
    quantity: "",
    description: "",
  });

  const handleStockMovement = async () => {
    try {
      const movementQuantity = parseFloat(movementData.quantity);
      let newQuantity = ingredient.quantity;

      if (movementData.type === "IN") {
        newQuantity += movementQuantity;
      } else {
        if (newQuantity < movementQuantity) {
          throw new Error("Quantidade insuficiente em estoque");
        }
        newQuantity -= movementQuantity;
      }

      const { error: movementError } = await supabase.from("stock_movements").insert({
        ingredient_id: ingredient.id,
        type: movementData.type,
        quantity: movementQuantity,
        description: movementData.description,
        restaurant_id: DEFAULT_RESTAURANT_ID,
      });

      if (movementError) throw movementError;

      const { error: updateError } = await supabase
        .from("ingredients")
        .update({ quantity: newQuantity })
        .eq("id", ingredient.id);

      if (updateError) throw updateError;

      if (newQuantity <= ingredient.alert_threshold) {
        toast({
          title: "Alerta de Estoque",
          description: `O ingrediente ${ingredient.name} está com estoque baixo!`,
          variant: "destructive",
        });
      }

      toast({
        title: "Sucesso",
        description: "Movimento registrado com sucesso!",
      });

      setMovementData({
        ingredient_id: "",
        type: "IN",
        quantity: "",
        description: "",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar movimento",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Movimentar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Movimentar Estoque</SheetTitle>
          <SheetDescription>
            Registre uma entrada ou saída de {ingredient.name}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <select
            className="w-full p-2 border rounded"
            value={movementData.type}
            onChange={(e) => setMovementData(prev => ({
              ...prev,
              type: e.target.value as "IN" | "OUT",
            }))}
          >
            <option value="IN">Entrada</option>
            <option value="OUT">Saída</option>
          </select>
          <Input
            type="number"
            placeholder="Quantidade"
            value={movementData.quantity}
            onChange={(e) => setMovementData(prev => ({ ...prev, quantity: e.target.value }))}
          />
          <Input
            placeholder="Descrição"
            value={movementData.description}
            onChange={(e) => setMovementData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={handleStockMovement}>
              Confirmar Movimentação
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
