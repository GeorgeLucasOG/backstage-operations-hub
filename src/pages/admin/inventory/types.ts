
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  supplier_id: string | null;
  alert_threshold: number | null;
  restaurantId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  address: string | null;
  restaurantId: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface StockMovement {
  id: string;
  ingredient_id: string;
  type: "IN" | "OUT";
  quantity: number;
  description: string | null;
  createdAt: string;
  restaurantId: string;
  updatedAt?: string | null;
}
