
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
  SheetClose,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AddSupplierSheetProps {
  onSuccess: () => void;
}

export function AddSupplierSheet({ onSuccess }: AddSupplierSheetProps) {
  const { toast } = useToast();
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    cnpj: "",
    address: "",
  });

  const handleAddSupplier = async () => {
    try {
      const { error } = await supabase.from("suppliers").insert({
        ...newSupplier,
        restaurant_id: "temp-id",
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fornecedor adicionado com sucesso!",
      });

      setNewSupplier({
        name: "",
        company_name: "",
        email: "",
        phone: "",
        cnpj: "",
        address: "",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar fornecedor",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Fornecedor</SheetTitle>
          <SheetDescription>
            Cadastre um novo fornecedor
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Nome Fantasia"
            value={newSupplier.name}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Razão Social (opcional)"
            value={newSupplier.company_name}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, company_name: e.target.value }))}
          />
          <Input
            placeholder="CNPJ (opcional)"
            value={newSupplier.cnpj}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, cnpj: e.target.value }))}
          />
          <Input
            placeholder="Email"
            type="email"
            value={newSupplier.email}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
          />
          <Input
            placeholder="Telefone"
            value={newSupplier.phone}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
          />
          <Input
            placeholder="Endereço"
            value={newSupplier.address}
            onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button onClick={handleAddSupplier}>Adicionar Fornecedor</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
