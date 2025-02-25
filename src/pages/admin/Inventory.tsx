
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Plus } from "lucide-react";
import { format } from "date-fns";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  supplier_id: string | null;
  alert_threshold: number;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  restaurant_id: string;
}

interface StockMovement {
  id: string;
  ingredient_id: string;
  type: "IN" | "OUT";
  quantity: number;
  description: string;
  created_at: string;
}

const Inventory = () => {
  const { toast } = useToast();
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    min_quantity: "",
    unit: "",
    alert_threshold: "",
    supplier_id: "",
  });
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
  });
  const [movementData, setMovementData] = useState({
    ingredient_id: "",
    type: "IN" as "IN" | "OUT",
    quantity: "",
    description: "",
  });

  // Carregar ingredientes
  const { data: ingredients, refetch: refetchIngredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Ingredient[];
    },
  });

  // Carregar fornecedores
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Supplier[];
    },
  });

  // Carregar movimentações
  const { data: movements, refetch: refetchMovements } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as StockMovement[];
    },
  });

  const handleAddIngredient = async () => {
    try {
      const { error } = await supabase.from("ingredients").insert({
        name: newIngredient.name,
        quantity: parseFloat(newIngredient.quantity),
        min_quantity: parseFloat(newIngredient.min_quantity),
        unit: newIngredient.unit,
        alert_threshold: parseFloat(newIngredient.alert_threshold),
        supplier_id: newIngredient.supplier_id || null,
        restaurant_id: "temp-id", // Substituir pelo ID real do restaurante
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ingrediente adicionado com sucesso!",
      });

      setNewIngredient({
        name: "",
        quantity: "",
        min_quantity: "",
        unit: "",
        alert_threshold: "",
        supplier_id: "",
      });
      refetchIngredients();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar ingrediente",
        variant: "destructive",
      });
    }
  };

  const handleAddSupplier = async () => {
    try {
      const { error } = await supabase.from("suppliers").insert({
        ...newSupplier,
        restaurant_id: "temp-id", // Substituir pelo ID real do restaurante
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fornecedor adicionado com sucesso!",
      });

      setNewSupplier({
        name: "",
        email: "",
        phone: "",
        document: "",
        address: "",
      });
      refetchIngredients();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar fornecedor",
        variant: "destructive",
      });
    }
  };

  const handleStockMovement = async () => {
    try {
      const ingredient = ingredients?.find(i => i.id === movementData.ingredient_id);
      if (!ingredient) throw new Error("Ingrediente não encontrado");

      const movementQuantity = parseFloat(movementData.quantity);
      let newQuantity = ingredient.quantity;

      if (movementData.type === "IN") {
        newQuantity += movementQuantity;
      } else {
        if (newQuantity < movementQuantity) {
          throw new Error("Quantidade insuficiente em estoque");
        }
        newQuantity -= movementQuantity;
      }

      // Registrar movimento
      const { error: movementError } = await supabase.from("stock_movements").insert({
        ingredient_id: movementData.ingredient_id,
        type: movementData.type,
        quantity: movementQuantity,
        description: movementData.description,
        restaurant_id: "temp-id", // Substituir pelo ID real do restaurante
      });

      if (movementError) throw movementError;

      // Atualizar quantidade do ingrediente
      const { error: updateError } = await supabase
        .from("ingredients")
        .update({ quantity: newQuantity })
        .eq("id", movementData.ingredient_id);

      if (updateError) throw updateError;

      // Verificar se precisa emitir alerta de estoque baixo
      if (newQuantity <= ingredient.alert_threshold) {
        toast({
          title: "Alerta de Estoque",
          description: `O ingrediente ${ingredient.name} está com estoque baixo!`,
          variant: "destructive",
        });
      }

      toast({
        title: "Sucesso",
        description: "Movimento registrado com sucesso!",
      });

      setMovementData({
        ingredient_id: "",
        type: "IN",
        quantity: "",
        description: "",
      });
      refetchIngredients();
      refetchMovements();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar movimento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Controle de Estoque</h1>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Ingrediente
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Adicionar Ingrediente</SheetTitle>
                <SheetDescription>
                  Cadastre um novo ingrediente no estoque
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Nome"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Quantidade"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Quantidade Mínima"
                  value={newIngredient.min_quantity}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, min_quantity: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Alerta de Estoque Baixo"
                  value={newIngredient.alert_threshold}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, alert_threshold: e.target.value }))}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={newIngredient.unit}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
                >
                  <option value="">Selecione a Unidade</option>
                  <option value="L">Litros</option>
                  <option value="KG">Kilogramas</option>
                  <option value="UN">Unidades</option>
                  <option value="G">Gramas</option>
                  <option value="ML">Mililitros</option>
                </select>
                <select
                  className="w-full p-2 border rounded"
                  value={newIngredient.supplier_id}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, supplier_id: e.target.value }))}
                >
                  <option value="">Selecione o Fornecedor</option>
                  {suppliers?.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button onClick={handleAddIngredient}>Adicionar Ingrediente</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

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
                  placeholder="Nome"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
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
                  placeholder="Documento"
                  value={newSupplier.document}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, document: e.target.value }))}
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
        </div>
      </div>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Ingredientes em Estoque</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Alerta</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients?.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>{ingredient.name}</TableCell>
                <TableCell>{ingredient.quantity}</TableCell>
                <TableCell>{ingredient.unit}</TableCell>
                <TableCell>{ingredient.min_quantity}</TableCell>
                <TableCell>{ingredient.alert_threshold}</TableCell>
                <TableCell>
                  {suppliers?.find(s => s.id === ingredient.supplier_id)?.name || "-"}
                </TableCell>
                <TableCell>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        Movimentar
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Movimentar Estoque</SheetTitle>
                        <SheetDescription>
                          Registre uma entrada ou saída de {ingredient.name}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="space-y-4 py-4">
                        <select
                          className="w-full p-2 border rounded"
                          value={movementData.type}
                          onChange={(e) => setMovementData(prev => ({ 
                            ...prev,
                            type: e.target.value as "IN" | "OUT",
                            ingredient_id: ingredient.id
                          }))}
                        >
                          <option value="IN">Entrada</option>
                          <option value="OUT">Saída</option>
                        </select>
                        <Input
                          type="number"
                          placeholder="Quantidade"
                          value={movementData.quantity}
                          onChange={(e) => setMovementData(prev => ({ ...prev, quantity: e.target.value }))}
                        />
                        <Input
                          placeholder="Descrição"
                          value={movementData.description}
                          onChange={(e) => setMovementData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <SheetFooter>
                        <SheetClose asChild>
                          <Button onClick={handleStockMovement}>
                            Confirmar Movimentação
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Alertas de Estoque Baixo</h2>
        <div className="space-y-2">
          {ingredients?.filter(i => i.quantity <= i.alert_threshold).map(ingredient => (
            <div
              key={ingredient.id}
              className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>
                {ingredient.name} está com estoque baixo ({ingredient.quantity} {ingredient.unit})
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Fornecedores</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Endereço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers?.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.document}</TableCell>
                <TableCell>{supplier.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Histórico de Movimentações</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Ingrediente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements?.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {format(new Date(movement.created_at), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {ingredients?.find(i => i.id === movement.ingredient_id)?.name}
                </TableCell>
                <TableCell>{movement.type === "IN" ? "Entrada" : "Saída"}</TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>{movement.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Inventory;
