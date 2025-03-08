
import { format } from "date-fns";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "dd/MM/yyyy HH:mm");
};

export const getPaymentMethodLabel = (method: string): string => {
  const methods: Record<string, string> = {
    CASH: "Dinheiro",
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    PIX: "PIX",
    OTHER: "Outro"
  };
  
  return methods[method] || method;
};
