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
interface AccountsReceivable {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  receivedDate: string | null;
  status: string;
  restaurantId: string;
  boletoCode: string | null;
  pixKey: string | null;
  createdAt: string;
  updatedAt: string | null;
}

const AccountsReceivable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountsReceivable | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    description: "",
    amount: "",
    dueDate: "",
    pixKey: "",
    boletoCode: "",
  });

  const { data: accountsReceivable, isLoading, refetch } = useQuery({
    queryKey: ["accountsReceivable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("AccountsReceivable")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao consultar contas a receber:", error);
        throw new Error("Não foi possível carregar as contas a receber");
      }

      console.log("Dados de contas a receber obtidos:", data);
      return data as AccountsReceivable[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newAccount: {
      description: string;
      amount: number;
      dueDate: string;
      pixKey: string | null;
      boletoCode: string | null;
    }) => {
      console.log("Iniciando adição de conta a receber com dados:", newAccount);

      const { data, error } = await supabase
        .from("AccountsReceivable")
        .insert([
          {
            description: newAccount.description,
            amount: newAccount.amount,
            dueDate: newAccount.dueDate,
            pixKey: newAccount.pixKey,
            boletoCode: newAccount.boletoCode,
            restaurantId: "d2d5278d-8df1-4819-87a0-f23b519e3f2a", // Substitua pelo ID do restaurante atual
            status: "PENDING", // Defina o status inicial
          },
        ])
        .select();

      if (error) {
        console.error("Erro ao adicionar conta a receber:", error);
        throw new Error(`Erro ao adicionar conta a receber: ${error.message}`);
      }

      console.log("Conta a receber adicionada com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountsReceivable"] });
      setIsOpen(false);
      setNewAccount({
        description: "",
        amount: "",
        dueDate: "",
        pixKey: "",
        boletoCode: "",
      });
      toast({
        title: "Sucesso",
        description: "Conta a receber adicionada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na adição:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao adicionar conta a receber",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedAccount: {
      id: string;
      description: string;
      amount: number;
      dueDate: string;
      receivedDate: string | null;
      status: string;
      pixKey: string | null;
      boletoCode: string | null;
    }) => {
      console.log("Iniciando atualização da conta a receber:", updatedAccount);

      const { data, error } = await supabase
        .from("AccountsReceivable")
        .update({
          description: updatedAccount.description,
          amount: updatedAccount.amount,
          dueDate: updatedAccount.dueDate,
          receivedDate: updatedAccount.receivedDate,
          status: updatedAccount.status,
          pixKey: updatedAccount.pixKey,
          boletoCode: updatedAccount.boletoCode,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", updatedAccount.id)
        .select();

      if (error) {
        console.error("Erro ao atualizar conta a receber:", error);
        throw new Error(`Erro ao atualizar conta a receber: ${error.message}`);
      }

      console.log("Conta a receber atualizada com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountsReceivable"] });
      setIsEditOpen(false);
      setEditingAccount(null);
      toast({
        title: "Sucesso",
        description: "Conta a receber atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na atualização:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao atualizar conta a receber",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Iniciando exclusão da conta a receber:", id);

      const { error } = await supabase
        .from("AccountsReceivable")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir conta a receber:", error);
        throw new Error(`Erro ao excluir conta a receber: ${error.message}`);
      }

      console.log("Conta a receber excluída com sucesso");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountsReceivable"] });
      toast({
        title: "Sucesso",
        description: "Conta a receber excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na exclusão:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao excluir conta a receber",
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
      console.log("Iniciando adição de conta a receber com dados:", newAccount);

      if (!newAccount.description.trim()) {
        throw new Error("A descrição é obrigatória");
      }

      if (!newAccount.amount || isNaN(parseFloat(newAccount.amount))) {
        throw new Error("O valor deve ser um número válido");
      }

      if (!newAccount.dueDate) {
        throw new Error("A data de vencimento é obrigatória");
      }

      await addMutation.mutateAsync({
        description: newAccount.description.trim(),
        amount: parseFloat(newAccount.amount),
        dueDate: newAccount.dueDate,
        pixKey: newAccount.pixKey?.trim() || null,
        boletoCode: newAccount.boletoCode?.trim() || null,
      });
    } catch (error) {
      console.error("Erro ao adicionar conta a receber:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar a conta a receber",
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

  const handleEdit = (account: AccountsReceivable) => {
    setEditingAccount(account);
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta conta a receber?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!editingAccount) return;

    try {
      if (!editingAccount.description.trim()) {
        throw new Error("A descrição é obrigatória");
      }

      if (isNaN(editingAccount.amount)) {
        throw new Error("O valor deve ser um número válido");
      }

      if (!editingAccount.dueDate) {
        throw new Error("A data de vencimento é obrigatória");
      }

      await updateMutation.mutateAsync({
        id: editingAccount.id,
        description: editingAccount.description.trim(),
        amount: editingAccount.amount,
        dueDate: editingAccount.dueDate,
        receivedDate: editingAccount.receivedDate,
        status: editingAccount.status,
        pixKey: editingAccount.pixKey?.trim() || null,
        boletoCode: editingAccount.boletoCode?.trim() || null,
      });
    } catch (error) {
      console.error("Erro ao atualizar conta a receber:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a conta a receber",
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

      if (name === "amount") {
        return { ...prev, amount: parseFloat(value) || 0 };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contas a Receber</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conta a Receber</DialogTitle>
              <DialogDescription>
                Preencha os campos para adicionar uma nova conta a receber.
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
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input
                  id="pixKey"
                  name="pixKey"
                  value={newAccount.pixKey}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boletoCode">Código de Boleto</Label>
                <Input
                  id="boletoCode"
                  name="boletoCode"
                  value={newAccount.boletoCode}
                  onChange={handleInputChange}
                  placeholder="Opcional"
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
                  {isSubmitting ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Conta a Receber</DialogTitle>
            <DialogDescription>
              Edite os campos para atualizar a conta a receber.
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
                <Label htmlFor="edit-pixKey">Chave Pix</Label>
                <Input
                  id="edit-pixKey"
                  name="pixKey"
                  value={editingAccount.pixKey || ""}
                  onChange={handleEditInputChange}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-boletoCode">Código de Boleto</Label>
                <Input
                  id="edit-boletoCode"
                  name="boletoCode"
                  value={editingAccount.boletoCode || ""}
                  onChange={handleEditInputChange}
                  placeholder="Opcional"
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
                  {isSubmitting ? "Atualizando..." : "Atualizar"}
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
                <TableHead>Valor (R$)</TableHead>
                <TableHead>Data de Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountsReceivable && accountsReceivable.length > 0 ? (
                accountsReceivable.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.description}</TableCell>
                    <TableCell>{account.amount}</TableCell>
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
                    Nenhuma conta a receber encontrada
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

export default AccountsReceivable;
