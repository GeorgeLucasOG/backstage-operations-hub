
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  supplier_id: string | null;
  alert_threshold: number;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  address: string | null;
  restaurant_id: string;
}

export interface StockMovement {
  id: string;
  ingredient_id: string;
  type: "IN" | "OUT";
  quantity: number;
  description: string;
  created_at: string;
}
