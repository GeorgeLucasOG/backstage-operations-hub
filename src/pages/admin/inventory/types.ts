
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  supplierId: string | null;
  alertThreshold: number | null;
  restaurantId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string | null;
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
  ingredientId: string;
  type: "IN" | "OUT";
  quantity: number;
  description: string | null;
  createdAt: string;
  restaurantId: string;
  updatedAt?: string | null;
}

export interface AccountPayable {
  id: string;
  description: string;
  pixKey: string | null;
  boletoCode: string | null;
  createdAt: string;
  dueDate: string;
  paidDate: string | null;
  restaurantId: string;
  amount: number;
  status: string;
  updatedAt: string | null;
}

export interface AccountReceivable {
  id: string;
  description: string;
  pixKey: string | null;
  boletoCode: string | null;
  createdAt: string;
  dueDate: string;
  receivedDate: string | null;
  restaurantId: string;
  amount: number;
  status: string;
  updatedAt: string | null;
}

export interface CashRegister {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  openedAt: string | null;
  closedAt: string | null;
  status: "OPEN" | "CLOSED";
  restaurantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  amount: number;
  type: "IN" | "OUT";
  description: string;
  paymentMethod: string;
  createdAt: string;
  orderId?: number;
  restaurantId: string;
  updatedAt?: string;
}
