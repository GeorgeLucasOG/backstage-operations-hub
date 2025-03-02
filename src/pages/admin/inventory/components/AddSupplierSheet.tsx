
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

export function AddSupplierSheet({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [supplierData, setSupplierData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    cnpj: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplierData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("suppliers").insert({
        name: supplierData.name,
        company_name: supplierData.company_name || null,
        email: supplierData.email || null,
        phone: supplierData.phone || null,
        cnpj: supplierData.cnpj || null,
        address: supplierData.address || null,
        restaurantId: DEFAULT_RESTAURANT_ID,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fornecedor adicionado com sucesso!",
      });

      setSupplierData({
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
        description: "Não foi possível adicionar o fornecedor",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Adicionar Fornecedor</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Fornecedor</SheetTitle>
          <SheetDescription>
            Preencha os dados para adicionar um novo fornecedor
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name">Nome</label>
            <Input 
              id="name"
              name="name"
              value={supplierData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="company_name">Nome da Empresa</label>
            <Input 
              id="company_name"
              name="company_name"
              value={supplierData.company_name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <Input 
              id="email"
              name="email"
              type="email"
              value={supplierData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone">Telefone</label>
            <Input 
              id="phone"
              name="phone"
              value={supplierData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cnpj">CNPJ</label>
            <Input 
              id="cnpj"
              name="cnpj"
              value={supplierData.cnpj}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="address">Endereço</label>
            <Input 
              id="address"
              name="address"
              value={supplierData.address}
              onChange={handleChange}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSubmit}>Adicionar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
