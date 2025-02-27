
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type AccountPayable = {
  id: string;
  description: string;
  pix_key: string | null;
  boleto_code: string | null;
  created_at: string;
  due_date: string;
  paid_date: string | null;
  restaurant_id: string;
  amount: number;
  status: string;
  updated_at: string;
};

const AccountsPayable = () => {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [boletoCode, setBoletoCode] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");

  const { data: accounts, refetch } = useQuery({
    queryKey: ["accounts-payable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts_payable")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AccountPayable[];
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("accounts_payable").insert({
        description,
        pix_key: pixKey,
        boleto_code: boletoCode,
        due_date: dueDate,
        amount: parseFloat(amount),
        restaurant_id: DEFAULT_RESTAURANT_ID,
        status: "PENDING"
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta a pagar criada com sucesso!",
      });

      // Limpar formulário
      setDescription("");
      setPixKey("");
      setBoletoCode("");
      setDueDate("");
      setAmount("");

      // Recarregar dados
      refetch();
    } catch (error) {
      console.error("Erro ao criar conta a pagar:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta a pagar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contas a Pagar</h1>
      
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Título"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Input
              placeholder="Chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
            <Input
              placeholder="Código do Boleto"
              value={boletoCode}
              onChange={(e) => setBoletoCode(e.target.value)}
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
          <Button type="submit">Adicionar</Button>
        </form>
      </Card>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>PIX</TableHead>
              <TableHead>Boleto</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.description}</TableCell>
                <TableCell>{account.pix_key}</TableCell>
                <TableCell>{account.boleto_code}</TableCell>
                <TableCell>{new Date(account.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(account.due_date).toLocaleDateString()}</TableCell>
                <TableCell>R$ {account.amount.toFixed(2)}</TableCell>
                <TableCell>{account.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AccountsPayable;
