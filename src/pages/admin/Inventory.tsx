
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddIngredientSheet } from "./inventory/components/AddIngredientSheet";
import { AddSupplierSheet } from "./inventory/components/AddSupplierSheet";
import { IngredientsList } from "./inventory/components/IngredientsList";
import { LowStockAlerts } from "./inventory/components/LowStockAlerts";
import { SuppliersList } from "./inventory/components/SuppliersList";
import { MovementHistory } from "./inventory/components/MovementHistory";
import type { Ingredient, Supplier, StockMovement } from "./inventory/types";

const Inventory = () => {
  const { data: ingredients, refetch: refetchIngredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Ingredients")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Ingredient[];
    },
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Suppliers")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Supplier[];
    },
  });

  const { data: movements, refetch: refetchMovements } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("StockMovements")
        .select("*")
        .order("createdAt", { ascending: false });
      
      if (error) throw error;
      return data as StockMovement[];
    },
  });

  const handleRefresh = () => {
    refetchIngredients();
    refetchMovements();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Controle de Estoque</h1>
        <div className="flex gap-2">
          <AddIngredientSheet onSuccess={handleRefresh} />
          <AddSupplierSheet onSuccess={handleRefresh} />
        </div>
      </div>

      <IngredientsList
        ingredients={ingredients}
        suppliers={suppliers}
        onMovement={handleRefresh}
      />
      
      <LowStockAlerts ingredients={ingredients} />
      
      <SuppliersList suppliers={suppliers} />
      
      <MovementHistory
        movements={movements}
        ingredients={ingredients}
      />
    </div>
  );
};

export default Inventory;
