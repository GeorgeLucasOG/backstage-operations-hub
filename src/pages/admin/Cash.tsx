
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format } from "date-fns";

type CashRegister = {
  id: string;
  name: string;
  initial_amount: number;
  current_amount: number;
  opened_at: string | null;
  closed_at: string | null;
  status: "OPEN" | "CLOSED";
  restaurant_id: string;
};

type CashMovement = {
  id: string;
  cash_register_id: string;
  amount: number;
  type: "IN" | "OUT";
  description: string;
  payment_method: string;
  created_at: string;
  order_id?: number;
  restaurant_id: string;
};

const Cash = () => {
  const { toast } = useToast();
  const [initialAmount, setInitialAmount] = useState("");
  const [cashName, setCashName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [changeAmount, setChangeAmount] = useState("");

  // Carregar registros de caixa
  const { data: registers, refetch: refetchRegisters } = useQuery({
    queryKey: ["cash-registers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_registers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CashRegister[];
    }
  });

  // Carregar movimentações do dia
  const { data: movements, refetch: refetchMovements } = useQuery({
    queryKey: ["cash-movements"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("cash_movements")
        .select("*")
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CashMovement[];
    }
  });

  const getCurrentRegister = () => {
    return registers?.find(register => register.status === "OPEN");
  };

  const handleOpenCash = async () => {
    try {
      const { error } = await supabase.from("cash_registers").insert({
        name: cashName,
        initial_amount: parseFloat(initialAmount),
        current_amount: parseFloat(initialAmount),
        opened_at: new Date().toISOString(),
        status: "OPEN",
        restaurant_id: "temp-id" // Substituir pelo ID real do restaurante
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Caixa aberto com sucesso!",
      });

      setCashName("");
      setInitialAmount("");
      refetchRegisters();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao abrir o caixa",
        variant: "destructive",
      });
    }
  };

  const handleCloseCash = async () => {
    const currentRegister = getCurrentRegister();
    if (!currentRegister) return;

    try {
      const { error } = await supabase
        .from("cash_registers")
        .update({
          status: "CLOSED",
          closed_at: new Date().toISOString()
        })
        .eq("id", currentRegister.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Caixa fechado com sucesso!",
      });

      refetchRegisters();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fechar o caixa",
        variant: "destructive",
      });
    }
  };

  const handleMovement = async (type: "IN" | "OUT") => {
    const currentRegister = getCurrentRegister();
    if (!currentRegister) {
      toast({
        title: "Erro",
        description: "Nenhum caixa aberto",
        variant: "destructive",
      });
      return;
    }

    try {
      const movementAmount = parseFloat(amount);
      let newAmount = currentRegister.current_amount;

      if (type === "IN") {
        newAmount += movementAmount;
      } else {
        if (newAmount < movementAmount) {
          throw new Error("Saldo insuficiente");
        }
        newAmount -= movementAmount;
      }

      // Registrar movimento
      const { error: movementError } = await supabase.from("cash_movements").insert({
        cash_register_id: currentRegister.id,
        amount: movementAmount,
        type,
        description,
        payment_method: paymentMethod,
        restaurant_id: currentRegister.restaurant_id
      });

      if (movementError) throw movementError;

      // Atualizar saldo do caixa
      const { error: updateError } = await supabase
        .from("cash_registers")
        .update({ current_amount: newAmount })
        .eq("id", currentRegister.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: `Movimento de ${type === "IN" ? "entrada" : "saída"} registrado!`,
      });

      setDescription("");
      setAmount("");
      setChangeAmount("");
      setPaymentMethod("CASH");
      refetchRegisters();
      refetchMovements();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar movimento",
        variant: "destructive",
      });
    }
  };

  const currentRegister = getCurrentRegister();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Caixa</h1>
      
      {!currentRegister ? (
        <Card className="p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Abrir Novo Caixa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Nome do Caixa"
                value={cashName}
                onChange={(e) => setCashName(e.target.value)}
                required
              />
              <Input
                type="number"
                placeholder="Valor Inicial"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                required
              />
            </div>
            <Button onClick={handleOpenCash}>Abrir Caixa</Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{currentRegister.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Aberto em: {format(new Date(currentRegister.opened_at!), "dd/MM/yyyy HH:mm")}
                </p>
                <p className="text-sm font-medium">
                  Saldo atual: R$ {currentRegister.current_amount.toFixed(2)}
                </p>
              </div>
              <Button variant="destructive" onClick={handleCloseCash}>
                Fechar Caixa
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full" variant="default">Nova Entrada</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Registrar Entrada</SheetTitle>
                  <SheetDescription>
                    Registre uma nova entrada de dinheiro no caixa
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Troco (opcional)"
                    value={changeAmount}
                    onChange={(e) => setChangeAmount(e.target.value)}
                  />
                  <select
                    className="w-full p-2 border rounded"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="CASH">Dinheiro</option>
                    <option value="CARD">Cartão</option>
                    <option value="PIX">PIX</option>
                  </select>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button onClick={() => handleMovement("IN")}>Confirmar Entrada</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button className="w-full" variant="secondary">Nova Saída</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Registrar Saída</SheetTitle>
                  <SheetDescription>
                    Registre uma nova saída de dinheiro do caixa
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="secondary" onClick={() => handleMovement("OUT")}>
                      Confirmar Saída
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Movimentações do Dia</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements?.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {format(new Date(movement.created_at), "HH:mm")}
                    </TableCell>
                    <TableCell>{movement.type === "IN" ? "Entrada" : "Saída"}</TableCell>
                    <TableCell>{movement.description}</TableCell>
                    <TableCell>{movement.payment_method}</TableCell>
                    <TableCell className={movement.type === "IN" ? "text-green-600" : "text-red-600"}>
                      R$ {movement.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {registers && registers.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Histórico de Caixas</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Valor Inicial</TableHead>
                <TableHead>Valor Final</TableHead>
                <TableHead>Abertura</TableHead>
                <TableHead>Fechamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registers.map((register) => (
                <TableRow key={register.id}>
                  <TableCell>{register.name}</TableCell>
                  <TableCell>R$ {register.initial_amount.toFixed(2)}</TableCell>
                  <TableCell>R$ {register.current_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {register.opened_at ? format(new Date(register.opened_at), "dd/MM/yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell>
                    {register.closed_at ? format(new Date(register.closed_at), "dd/MM/yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell>{register.status === "OPEN" ? "Aberto" : "Fechado"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Cash;
