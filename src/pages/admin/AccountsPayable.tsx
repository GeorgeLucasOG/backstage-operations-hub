import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// Define types here instead of importing from deleted inventory/types
interface AccountsPayable {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  restaurantId: string;
  boletoCode: string | null;
  pixKey: string | null;
  createdAt: string;
  updatedAt: string | null;
}

const AccountsPayablePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountsPayable | null>(
    null
  );
  const [newAccount, setNewAccount] = useState({
    description: "",
    amount: "",
    dueDate: "",
    boletoCode: "",
    pixKey: "",
  });

  const { data: accountsPayable, isLoading, refetch } = useQuery({
    queryKey: ["accountsPayable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("AccountsPayable")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao consultar contas a pagar:", error);
        throw new Error("Não foi possível carregar as contas a pagar");
      }

      console.log("Dados de contas a pagar obtidos:", data);
      return data as AccountsPayable[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedAccount: AccountsPayable) => {
      console.log("Iniciando atualização da conta a pagar:", updatedAccount);

      const { data, error } = await supabase
        .from("AccountsPayable")
        .update({
          description: updatedAccount.description,
          amount: updatedAccount.amount,
          dueDate: updatedAccount.dueDate,
          paidDate: updatedAccount.paidDate,
          status: updatedAccount.status,
          boletoCode: updatedAccount.boletoCode,
          pixKey: updatedAccount.pixKey,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", updatedAccount.id)
        .select();

      if (error) {
        console.error("Erro ao atualizar conta a pagar:", error);
        throw new Error(`Erro ao atualizar conta a pagar: ${error.message}`);
      }

      console.log("Conta a pagar atualizada com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountsPayable"] });
      setIsEditOpen(false);
      setEditingAccount(null);
      toast({
        title: "Sucesso",
        description: "Conta a pagar atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na atualização:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar conta a pagar",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Iniciando exclusão da conta a pagar:", id);

      const { error } = await supabase
        .from("AccountsPayable")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir conta a pagar:", error);
        throw new Error(`Erro ao excluir conta a pagar: ${error.message}`);
      }

      console.log("Conta a pagar excluída com sucesso");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountsPayable"] });
      toast({
        title: "Sucesso",
        description: "Conta a pagar excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na exclusão:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao excluir conta a pagar",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Iniciando adição de conta a pagar com dados:", newAccount);

      if (!newAccount.description.trim()) {
        throw new Error("A descrição da conta a pagar é obrigatória");
      }

      if (!newAccount.amount || isNaN(parseFloat(newAccount.amount))) {
        throw new Error("O valor deve ser um número válido");
      }

      if (!newAccount.dueDate) {
        throw new Error("A data de vencimento é obrigatória");
      }

      const { data, error } = await supabase.from("AccountsPayable").insert([
        {
          description: newAccount.description.trim(),
          amount: parseFloat(newAccount.amount) || 0,
          dueDate: newAccount.dueDate,
          boletoCode: newAccount.boletoCode?.trim() || null,
          pixKey: newAccount.pixKey?.trim() || null,
          restaurantId: "d2d5278d-8df1-4819-87a0-f23b519e3f2a", // Substitua pelo ID do restaurante atual
          status: "PENDING", // Defina um status padrão
        },
      ]);

      if (error) throw error;

      toast({
        title: "Conta a pagar adicionada",
        description: "A conta a pagar foi adicionada com sucesso",
      });

      setIsOpen(false);
      setNewAccount({
        description: "",
        amount: "",
        dueDate: "",
        boletoCode: "",
        pixKey: "",
      });

      refetch();
    } catch (error) {
      console.error("Erro ao adicionar conta a pagar:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar a conta a pagar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const handleEdit = (account: AccountsPayable) => {
    setEditingAccount(account);
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta conta a pagar?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAccount) return;

    setIsSubmitting(true);

    try {
      if (!editingAccount.description.trim()) {
        throw new Error("A descrição da conta a pagar é obrigatória");
      }

      if (isNaN(editingAccount.amount) || editingAccount.amount <= 0) {
        throw new Error("O valor deve ser um número válido maior que zero");
      }

      if (!editingAccount.dueDate) {
        throw new Error("A data de vencimento é obrigatória");
      }

      updateMutation.mutate({
        ...editingAccount,
        amount: parseFloat(editingAccount.amount.toString()),
      });
    } catch (error) {
      console.error("Erro ao processar edição:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar conta a pagar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (!editingAccount) return;

    setEditingAccount((prev) => {
      if (!prev) return prev;

      return { ...prev, [name]: value };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contas a Pagar</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conta a Pagar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conta a Pagar</DialogTitle>
              <DialogDescription>
                Preencha os campos para adicionar uma nova conta a pagar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  value={newAccount.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={newAccount.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={newAccount.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boletoCode">Código de Boleto</Label>
                <Input
                  id="boletoCode"
                  name="boletoCode"
                  value={newAccount.boletoCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input
                  id="pixKey"
                  name="pixKey"
                  value={newAccount.pixKey}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Conta a Pagar</DialogTitle>
            <DialogDescription>
              Edite os campos para atualizar a conta a pagar.
            </DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  name="description"
                  value={editingAccount.description}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Valor (R$)</Label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={editingAccount.amount}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Data de Vencimento</Label>
                <Input
                  id="edit-dueDate"
                  name="dueDate"
                  type="date"
                  value={editingAccount.dueDate}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-boletoCode">Código de Boleto</Label>
                <Input
                  id="edit-boletoCode"
                  name="boletoCode"
                  value={editingAccount.boletoCode || ""}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pixKey">Chave Pix</Label>
                <Input
                  id="edit-pixKey"
                  name="pixKey"
                  value={editingAccount.pixKey || ""}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data de Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountsPayable && accountsPayable.length > 0 ? (
                accountsPayable.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.description}</TableCell>
                    <TableCell>{formatCurrency(account.amount)}</TableCell>
                    <TableCell>{formatDate(account.dueDate)}</TableCell>
                    <TableCell>{account.status}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhuma conta a pagar encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AccountsPayablePage;
