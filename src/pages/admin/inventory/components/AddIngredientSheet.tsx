
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
    minQuantity: "",
    alertThreshold: "",
    unit: "",
    supplierId: "",
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Suppliers")
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
      const { error } = await supabase.from("Ingredients").insert({
        name: ingredientData.name,
        quantity: parseFloat(ingredientData.quantity) || 0,
        minQuantity: parseFloat(ingredientData.minQuantity) || 0,
        alertThreshold: parseFloat(ingredientData.alertThreshold) || 0,
        unit: ingredientData.unit,
        supplierId: ingredientData.supplierId || null,
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
        minQuantity: "",
        alertThreshold: "",
        unit: "",
        supplierId: "",
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
            <label htmlFor="minQuantity">Quantidade Mínima</label>
            <Input 
              id="minQuantity"
              name="minQuantity"
              type="number"
              value={ingredientData.minQuantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="alertThreshold">Limite para Alerta</label>
            <Input 
              id="alertThreshold"
              name="alertThreshold"
              type="number"
              value={ingredientData.alertThreshold}
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
            <label htmlFor="supplierId">Fornecedor</label>
            <select
              id="supplierId"
              name="supplierId"
              className="w-full p-2 border rounded"
              value={ingredientData.supplierId}
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
