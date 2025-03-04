
import { format } from "date-fns";
import { Check, Clock, Pencil, Trash } from "lucide-react";
import { Order, Restaurant } from "../types";
import { getStatusLabel, formatConsumption } from "../utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrdersTableProps {
  orders: Order[];
  restaurants: Restaurant[];
  onEdit: (order: Order) => void;
  onDelete: (id: number) => void;
  onStatusUpdate: (id: number, status: "PENDING" | "IN_PREPARATION" | "FINISHED") => void;
  isLoading: boolean;
}

export const OrdersTable = ({
  orders,
  restaurants,
  onEdit,
  onDelete,
  onStatusUpdate,
  isLoading,
}: OrdersTableProps) => {
  const restaurantMap = restaurants.reduce((acc, restaurant) => {
    acc[restaurant.id] = restaurant.name;
    return acc;
  }, {} as Record<string, string>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Carregando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Restaurante</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[200px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.customerCpf || "-"}</TableCell>
                <TableCell>
                  {formatConsumption(order.consumptionMethod)}
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(order.total)}
                </TableCell>
                <TableCell>
                  {restaurantMap[order.restaurantId] || order.restaurantId}
                </TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{getStatusLabel(order.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {order.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onStatusUpdate(order.id, "IN_PREPARATION")
                        }
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Preparando
                      </Button>
                    )}
                    {order.status === "IN_PREPARATION" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onStatusUpdate(order.id, "FINISHED")
                        }
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Finalizar
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => onEdit(order)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => onDelete(order.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Nenhum pedido encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
