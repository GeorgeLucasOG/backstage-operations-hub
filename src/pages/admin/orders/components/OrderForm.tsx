
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Order, Restaurant, OrderFormData } from "../types";

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  initialData?: Order | null;
  buttonText?: string;
  restaurants?: Restaurant[];
}

export const OrderForm = ({
  onSubmit,
  initialData = null,
  buttonText = "Criar Pedido",
  restaurants = [],
}: OrderFormProps) => {
  const getInitialFormData = (): OrderFormData => {
    if (initialData) {
      return {
        customerName: initialData.customerName,
        customerCpf: initialData.customerCpf || "",
        tableNumber: "",
        total: initialData.total.toString(),
        consumptionMethod: initialData.consumptionMethod,
        restaurantId: initialData.restaurantId,
      };
    }

    const defaultRestaurantId =
      restaurants.length > 0 ? restaurants[0].id : "";

    return {
      customerName: "",
      customerCpf: "",
      tableNumber: "",
      total: "",
      consumptionMethod: "DINE_IN",
      restaurantId: defaultRestaurantId,
    };
  };

  const [formData, setFormData] = useState<OrderFormData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (restaurants.length > 0 && !formData.restaurantId) {
      setFormData((prev) => ({
        ...prev,
        restaurantId: restaurants[0].id,
      }));
    }
  }, [restaurants]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.customerName.trim()) {
      alert("Nome do cliente é obrigatório");
      setIsSubmitting(false);
      return;
    }

    if (formData.consumptionMethod === "DINE_IN" && !formData.tableNumber) {
      alert("Número da mesa é obrigatório para consumo no local");
      setIsSubmitting(false);
      return;
    }

    if (
      !formData.total ||
      isNaN(parseFloat(formData.total)) ||
      parseFloat(formData.total) <= 0
    ) {
      alert("Informe um valor total válido");
      setIsSubmitting(false);
      return;
    }

    if (!formData.restaurantId) {
      alert("Selecione um restaurante");
      setIsSubmitting(false);
      return;
    }

    onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Nome do Cliente</Label>
        <Input
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerCpf">CPF (opcional)</Label>
        <Input
          id="customerCpf"
          name="customerCpf"
          value={formData.customerCpf}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="restaurantId">Restaurante</Label>
        <select
          id="restaurantId"
          name="restaurantId"
          className="w-full p-2 border rounded"
          value={formData.restaurantId}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um restaurante</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="consumptionMethod">Método de Consumo</Label>
        <select
          id="consumptionMethod"
          name="consumptionMethod"
          className="w-full p-2 border rounded"
          value={formData.consumptionMethod}
          onChange={handleChange}
          required
        >
          <option value="DINE_IN">No Local</option>
          <option value="TAKEAWAY">Para Viagem</option>
        </select>
      </div>
      {formData.consumptionMethod === "DINE_IN" && (
        <div className="space-y-2">
          <Label htmlFor="tableNumber">Número da Mesa</Label>
          <Input
            id="tableNumber"
            name="tableNumber"
            type="number"
            value={formData.tableNumber}
            onChange={handleChange}
            required
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="total">Valor Total</Label>
        <Input
          id="total"
          name="total"
          type="number"
          step="0.01"
          value={formData.total}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Processando..." : buttonText}
      </Button>
    </form>
  );
};

export default OrderForm;
