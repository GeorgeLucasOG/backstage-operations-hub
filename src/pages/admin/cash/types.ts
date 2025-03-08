
export interface CashRegister {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  status: 'OPEN' | 'CLOSED';
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
  type: 'INCOME' | 'EXPENSE';
  paymentMethod: string;
  cashRegisterId: string;
  restaurantId: string;
  orderId: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'OTHER';
