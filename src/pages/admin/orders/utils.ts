
import { Badge } from "@/components/ui/badge";

export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">Pendente</Badge>;
    case "IN_PREPARATION":
      return <Badge variant="secondary">Em Preparação</Badge>;
    case "FINISHED":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Finalizado
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export const formatConsumption = (method: string) => {
  return method === "DINE_IN" ? "No Local" : "Para Viagem";
};
