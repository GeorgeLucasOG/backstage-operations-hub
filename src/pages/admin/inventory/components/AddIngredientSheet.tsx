
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
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "../types";

interface AddIngredientSheetProps {
  suppliers: Supplier[] | undefined;
  onSuccess: () => void;
}

export function AddIngredientSheet({ suppliers, onSuccess }: AddIngredientSheetProps) {
  const { toast } = useToast();
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    min_quantity: "",
    unit: "",
    alert_threshold: "",
    supplier_id: "",
  });

  const handleAddIngredient = async () => {
    try {
      const { error } = await supabase.from("ingredients").insert({
        name: newIngredient.name,
        quantity: parseFloat(newIngredient.quantity),
        min_quantity: parseFloat(newIngredient.min_quantity),
        unit: newIngredient.unit,
        alert_threshold: parseFloat(newIngredient.alert_threshold),
        supplier_id: newIngredient.supplier_id || null,
        restaurant_id: "temp-id",
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ingrediente adicionado com sucesso!",
      });

      setNewIngredient({
        name: "",
        quantity: "",
        min_quantity: "",
        unit: "",
        alert_threshold: "",
        supplier_id: "",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar ingrediente",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Ingrediente
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Ingrediente</SheetTitle>
          <SheetDescription>
            Cadastre um novo ingrediente no estoque
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Nome"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Quantidade"
            value={newIngredient.quantity}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Quantidade Mínima"
            value={newIngredient.min_quantity}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, min_quantity: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Alerta de Estoque Baixo"
            value={newIngredient.alert_threshold}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, alert_threshold: e.target.value }))}
          />
          <select
            className="w-full p-2 border rounded"
            value={newIngredient.unit}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
          >
            <option value="">Selecione a Unidade</option>
            <option value="L">Litros</option>
            <option value="KG">Kilogramas</option>
            <option value="UN">Unidades</option>
            <option value="G">Gramas</option>
            <option value="ML">Mililitros</option>
          </select>
          <select
            className="w-full p-2 border rounded"
            value={newIngredient.supplier_id}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, supplier_id: e.target.value }))}
          >
            <option value="">Selecione o Fornecedor</option>
            {suppliers?.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={handleAddIngredient}>Adicionar Ingrediente</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
