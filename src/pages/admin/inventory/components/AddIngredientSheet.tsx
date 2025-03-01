
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
} from "@/components/ui/sheet";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "../types";

interface AddIngredientSheetProps {
  suppliers?: Supplier[] | null;
  onSuccess: () => void;
}

export function AddIngredientSheet({ suppliers = [], onSuccess }: AddIngredientSheetProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    quantity: "0",
    unit: "unidade",
    min_quantity: "0",
    alert_threshold: "0",
    supplier_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = async () => {
    try {
      const { error } = await supabase.from("ingredients").insert({
        name: formData.name,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        min_quantity: parseFloat(formData.min_quantity),
        alert_threshold: parseFloat(formData.alert_threshold),
        supplier_id: formData.supplier_id || null,
        restaurant_id: DEFAULT_RESTAURANT_ID
      });

      if (error) throw error;

      toast({
        title: "Ingrediente adicionado",
        description: "O ingrediente foi cadastrado com sucesso!",
      });

      setFormData({
        name: "",
        quantity: "0",
        unit: "unidade",
        min_quantity: "0",
        alert_threshold: "0",
        supplier_id: "",
      });

      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar ingrediente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o ingrediente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Novo Ingrediente</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Ingrediente</SheetTitle>
          <SheetDescription>
            Adicione um novo ingrediente ao seu estoque
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">Quantidade</label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="unit" className="text-sm font-medium">Unidade</label>
              <select
                id="unit"
                name="unit"
                className="w-full p-2 border rounded"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="unidade">Unidade</option>
                <option value="kg">Kilogramas (kg)</option>
                <option value="g">Gramas (g)</option>
                <option value="l">Litros (l)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="caixa">Caixa</option>
                <option value="pacote">Pacote</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="min_quantity" className="text-sm font-medium">Mínimo</label>
              <Input
                id="min_quantity"
                name="min_quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.min_quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="alert_threshold" className="text-sm font-medium">Alerta</label>
              <Input
                id="alert_threshold"
                name="alert_threshold"
                type="number"
                min="0"
                step="0.01"
                value={formData.alert_threshold}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="supplier_id" className="text-sm font-medium">Fornecedor</label>
            <select
              id="supplier_id"
              name="supplier_id"
              className="w-full p-2 border rounded"
              value={formData.supplier_id}
              onChange={handleChange}
            >
              <option value="">Selecione um fornecedor (opcional)</option>
              {suppliers?.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleAddIngredient}>Adicionar Ingrediente</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
