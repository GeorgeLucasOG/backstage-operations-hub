
import React from 'react';
import { Order, Restaurant, OrderFormData } from "../types";
import { OrderForm } from "./OrderForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface OrderSheetsProps {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  editingOrder: Order | null;
  restaurants: Restaurant[];
  onCreateSubmit: (data: OrderFormData) => void;
  onUpdateSubmit: (data: OrderFormData & { id: number }) => void;
  noRestaurants: boolean;
}

export const OrderSheets = ({
  isCreateOpen,
  setIsCreateOpen,
  isEditOpen,
  setIsEditOpen,
  editingOrder,
  restaurants,
  onCreateSubmit,
  onUpdateSubmit,
  noRestaurants,
}: OrderSheetsProps) => {
  return (
    <>
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Novo Pedido</SheetTitle>
            <SheetDescription>
              Preencha os dados para criar um novo pedido
            </SheetDescription>
          </SheetHeader>
          {noRestaurants ? (
            <div className="mt-4 p-4 border border-red-200 rounded bg-red-50 text-red-700">
              <p>
                Não há restaurantes cadastrados. Adicione pelo menos um
                restaurante antes de criar pedidos.
              </p>
            </div>
          ) : (
            <OrderForm
              onSubmit={(data) => onCreateSubmit(data)}
              restaurants={restaurants}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Pedido #{editingOrder?.id}</SheetTitle>
            <SheetDescription>
              Atualize os dados do pedido conforme necessário
            </SheetDescription>
          </SheetHeader>
          {editingOrder && (
            <OrderForm
              initialData={editingOrder}
              onSubmit={(data) =>
                onUpdateSubmit({
                  ...data,
                  id: editingOrder.id,
                })
              }
              buttonText="Atualizar Pedido"
              restaurants={restaurants}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default OrderSheets;
