
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AddSupplierSheetProps {
  onSuccess: () => void;
}

export function AddSupplierSheet({ onSuccess }: AddSupplierSheetProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    cnpj: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSupplier = async () => {
    try {
      const { error } = await supabase.from("suppliers").insert({
        name: formData.name,
        company_name: formData.company_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        cnpj: formData.cnpj || null,
        address: formData.address || null,
        restaurant_id: DEFAULT_RESTAURANT_ID
      });

      if (error) throw error;

      toast({
        title: "Fornecedor adicionado",
        description: "O fornecedor foi cadastrado com sucesso!",
      });

      setFormData({
        name: "",
        company_name: "",
        email: "",
        phone: "",
        cnpj: "",
        address: "",
      });

      onSuccess();
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o fornecedor.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Novo Fornecedor</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Fornecedor</SheetTitle>
          <SheetDescription>
            Adicione um novo fornecedor para seus ingredientes
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nome*</label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="company_name" className="text-sm font-medium">Nome da Empresa</label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="cnpj" className="text-sm font-medium">CNPJ</label>
            <Input
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">Endereço</label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleAddSupplier}>Adicionar Fornecedor</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
