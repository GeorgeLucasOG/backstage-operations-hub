
export interface Order {
  id: number;
  customerName: string;
  customerCpf: string | null;
  total: number;
  status: "PENDING" | "IN_PREPARATION" | "FINISHED";
  consumptionMethod: "TAKEAWAY" | "DINE_IN";
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
}

export interface OrderFormData {
  customerName: string;
  customerCpf: string;
  tableNumber: string;
  total: string;
  consumptionMethod: "TAKEAWAY" | "DINE_IN";
  restaurantId: string;
}
