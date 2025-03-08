
export interface CashRegister {
  id: string;
  name: string;
  initialamount: number;
  currentamount: number;
  status: 'OPEN' | 'CLOSED';
  restaurantid: string;
  openedat: string | null;
  closedat: string | null;
  createdat: string;
  updatedat: string | null;
}

export interface CashMovement {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  paymentmethod: string;
  cashregisterid: string;
  restaurantid: string;
  orderid: number | null;
  createdat: string;
  updatedat: string | null;
}

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'OTHER';
