
export interface CashRegister {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  status: string;
  restaurantId: string;
  openedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CashMovement {
  id: string;
  description: string;
  amount: number;
  type: string;
  paymentMethod: string;
  cashRegisterId: string;
  restaurantId: string;
  orderId: number | null;
  createdAt: string;
  updatedAt: string | null;
}
