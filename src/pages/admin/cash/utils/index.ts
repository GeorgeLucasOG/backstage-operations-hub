import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata um valor numérico como moeda brasileira (R$)
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Formata uma data ISO para o formato brasileiro (dd/MM/yyyy HH:mm)
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "-";
  }

  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString || "-";
  }
};
