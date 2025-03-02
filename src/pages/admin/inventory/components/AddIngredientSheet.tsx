
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
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
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "../types";

export function AddIngredientSheet({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [ingredientData, setIngredientData] = useState({
    name: "",
    quantity: "",
    min_quantity: "",
    alert_threshold: "",
    unit: "",
    supplier_id: "",
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*");
      
      if (error) throw error;
      return data as Supplier[];
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIngredientData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("ingredients").insert({
        name: ingredientData.name,
        quantity: parseFloat(ingredientData.quantity) || 0,
        min_quantity: parseFloat(ingredientData.min_quantity) || 0,
        alert_threshold: parseFloat(ingredientData.alert_threshold) || 0,
        unit: ingredientData.unit,
        supplier_id: ingredientData.supplier_id || null,
        restaurantId: DEFAULT_RESTAURANT_ID,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ingrediente adicionado com sucesso!",
      });

      setIngredientData({
        name: "",
        quantity: "",
        min_quantity: "",
        alert_threshold: "",
        unit: "",
        supplier_id: "",
      });

      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar ingrediente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o ingrediente",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Adicionar Ingrediente</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Ingrediente</SheetTitle>
          <SheetDescription>
            Preencha os dados para adicionar um novo ingrediente ao estoque
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name">Nome</label>
            <Input 
              id="name"
              name="name"
              value={ingredientData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="quantity">Quantidade Atual</label>
            <Input 
              id="quantity"
              name="quantity"
              type="number"
              value={ingredientData.quantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="min_quantity">Quantidade Mínima</label>
            <Input 
              id="min_quantity"
              name="min_quantity"
              type="number"
              value={ingredientData.min_quantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="alert_threshold">Limite para Alerta</label>
            <Input 
              id="alert_threshold"
              name="alert_threshold"
              type="number"
              value={ingredientData.alert_threshold}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="unit">Unidade</label>
            <Input 
              id="unit"
              name="unit"
              value={ingredientData.unit}
              onChange={handleChange}
              placeholder="kg, g, L, ml, unidade"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="supplier_id">Fornecedor</label>
            <select
              id="supplier_id"
              name="supplier_id"
              className="w-full p-2 border rounded"
              value={ingredientData.supplier_id}
              onChange={handleChange}
            >
              <option value="">Selecione um fornecedor</option>
              {suppliers?.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSubmit}>Adicionar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
