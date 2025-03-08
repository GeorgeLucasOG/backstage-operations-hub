import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createCashRegister,
  fetchCashRegisters,
} from "../services/cashService";
import { fetchRestaurants } from "../../Restaurant/services/restaurantService";
import { fetchUsers } from "../services/userService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, AlertCircle, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AddCashRegisterDialogProps {
  onSuccess?: () => void;
}

interface Restaurant {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface DenominationValue {
  name: string;
  value: number;
  count: number;
}

// Valores de notas e moedas em BRL
const DENOMINATIONS: DenominationValue[] = [
  { name: "R$200", value: 200, count: 0 },
  { name: "R$100", value: 100, count: 0 },
  { name: "R$50", value: 50, count: 0 },
  { name: "R$20", value: 20, count: 0 },
  { name: "R$10", value: 10, count: 0 },
  { name: "R$5", value: 5, count: 0 },
  { name: "R$2", value: 2, count: 0 },
  { name: "Moeda R$1", value: 1, count: 0 },
  { name: "Moeda R$0,50", value: 0.5, count: 0 },
  { name: "Moeda R$0,25", value: 0.25, count: 0 },
  { name: "Moeda R$0,10", value: 0.1, count: 0 },
  { name: "Moeda R$0,05", value: 0.05, count: 0 },
];

const AddCashRegisterDialog = ({ onSuccess }: AddCashRegisterDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Caixa PDV");
  const [initialAmount, setInitialAmount] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    DEFAULT_RESTAURANT_ID
  );
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>("");
  const [showDenominations, setShowDenominations] = useState(false);
  const [denominations, setDenominations] = useState<DenominationValue[]>([
    ...DENOMINATIONS,
  ]);
  const [hasPendingChange, setHasPendingChange] = useState(false);
  const [pendingChangeValue, setPendingChangeValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular valor total baseado nas denominações
  const calculateTotalFromDenominations = () => {
    return denominations.reduce((total, item) => {
      return total + item.value * item.count;
    }, 0);
  };

  // Atualizar valor inicial quando as denominações mudam
  useEffect(() => {
    if (showDenominations) {
      const total = calculateTotalFromDenominations();
      setInitialAmount(total.toFixed(2));
    }
  }, [denominations, showDenominations]);

  // Buscar restaurantes
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useQuery<
    Restaurant[]
  >({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });

  // Buscar operadores (usuários)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Definir restaurante padrão ao carregar
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  // Atualizar quantidade de uma denominação
  const updateDenominationCount = (index: number, count: number) => {
    const newDenominations = [...denominations];
    newDenominations[index] = { ...newDenominations[index], count };
    setDenominations(newDenominations);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error("O nome do caixa é obrigatório");
      }

      if (!selectedOperatorId) {
        throw new Error("É necessário selecionar um operador para o caixa");
      }

      const amount =
        parseFloat(initialAmount) || calculateTotalFromDenominations();
      if (isNaN(amount) || amount < 0) {
        throw new Error(
          "O valor inicial deve ser um número válido maior ou igual a zero"
        );
      }

      if (!selectedRestaurantId) {
        throw new Error("É necessário selecionar um restaurante");
      }

      // Preparar dados do troco pendente, se houver
      const changeDetails = hasPendingChange
        ? {
            hasPendingChange: true,
            pendingChangeValue: parseFloat(pendingChangeValue) || 0,
          }
        : { hasPendingChange: false, pendingChangeValue: 0 };

      // Preparar dados detalhados de abertura do caixa
      const openingDetails = {
        operatorId: selectedOperatorId,
        operatorName:
          users.find((u) => u.id === selectedOperatorId)?.name ||
          "Desconhecido",
        denominations: showDenominations ? denominations : [],
        ...changeDetails,
      };

      return createCashRegister(
        name.trim(),
        amount,
        selectedRestaurantId,
        openingDetails
      );
    },
    onSuccess: async (data) => {
      try {
        // Forçar invalidação do cache e atualização dos dados
        console.log("Invalidando queries após criação bem-sucedida");
        await queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });

        // Mostrar mensagem de sucesso
        toast({
          title: "Sucesso",
          description: "Caixa PDV aberto com sucesso!",
        });

        // Resetar formulário
        setName("Caixa PDV");
        setInitialAmount("");
        setSelectedOperatorId("");
        setDenominations([...DENOMINATIONS]);
        setShowDenominations(false);
        setHasPendingChange(false);
        setPendingChangeValue("");

        // Fechar o diálogo
        setOpen(false);

        // Adicionar um atraso maior antes de chamar o callback de sucesso
        // para garantir que a UI tenha tempo de processar outras mudanças primeiro
        setTimeout(() => {
          try {
            if (onSuccess) {
              console.log("Executando callback de sucesso com segurança");
              // Envolver em try/catch para prevenir erros de propagarem
              onSuccess();
            }
          } catch (callbackError) {
            console.error("Erro no callback de sucesso:", callbackError);
            // Não mostrar toast de erro aqui para não confundir o usuário,
            // já que o caixa foi criado com sucesso
          }
        }, 1000); // Aumento para 1 segundo para dar mais tempo
      } catch (err) {
        console.error("Erro ao processar sucesso da criação:", err);
        // Ainda fechamos o modal e resetamos o form mesmo se houver erro no processo
        setOpen(false);
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao abrir caixa";

      // Verificar se o erro está relacionado ao status
      if (errorMessage.includes("CashRegisters_status_check")) {
        toast({
          title: "Erro de validação",
          description: "O status do caixa deve ser 'OPEN' ou 'CLOSED'",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  // Calcular total das denominações para exibição
  const denominationsTotal = calculateTotalFromDenominations();

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        // Se o diálogo for fechado, atualizar os dados
        if (!newOpen) {
          queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Abrir Caixa PDV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Abrir Novo Caixa PDV</DialogTitle>
          <DialogDescription>
            Preencha os dados para abrir um novo caixa para o restaurante
            selecionado.
          </DialogDescription>
        </DialogHeader>

        {isLoadingRestaurants || isLoadingUsers ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando dados...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Nenhum restaurante encontrado. É necessário cadastrar um
              restaurante antes de abrir um caixa.
            </AlertDescription>
          </Alert>
        ) : users.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Nenhum usuário/operador encontrado. É necessário cadastrar
              usuários antes de abrir um caixa.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do PDV</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Caixa PDV Principal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operator">Operador do Caixa</Label>
                <Select
                  value={selectedOperatorId}
                  onValueChange={setSelectedOperatorId}
                >
                  <SelectTrigger id="operator">
                    <SelectValue placeholder="Selecione o operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant">Restaurante</Label>
                <Select
                  value={selectedRestaurantId}
                  onValueChange={setSelectedRestaurantId}
                >
                  <SelectTrigger id="restaurant">
                    <SelectValue placeholder="Selecione um restaurante" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="initialAmount">Valor Inicial (R$)</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showDenominations"
                      checked={showDenominations}
                      onCheckedChange={(checked) =>
                        setShowDenominations(checked === true)
                      }
                    />
                    <Label
                      htmlFor="showDenominations"
                      className="text-xs cursor-pointer"
                    >
                      Detalhar Valores
                    </Label>
                  </div>
                </div>
                {!showDenominations && (
                  <Input
                    id="initialAmount"
                    type="number"
                    step="0.01"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    placeholder="0.00"
                  />
                )}
              </div>
            </div>

            {showDenominations && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Detalhe dos Valores</h3>
                    <span className="text-lg font-bold">
                      Total: R$ {denominationsTotal.toFixed(2)}
                    </span>
                  </div>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {denominations.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center space-x-2"
                      >
                        <Label
                          htmlFor={`denom-${index}`}
                          className="flex-1 text-sm"
                        >
                          {item.name}
                        </Label>
                        <Input
                          id={`denom-${index}`}
                          type="number"
                          min="0"
                          value={item.count || ""}
                          onChange={(e) =>
                            updateDenominationCount(
                              index,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPendingChange"
                checked={hasPendingChange}
                onCheckedChange={(checked) =>
                  setHasPendingChange(checked === true)
                }
              />
              <div className="flex-1 flex items-center space-x-2">
                <Label htmlFor="hasPendingChange" className="cursor-pointer">
                  Possui troco pendente?
                </Label>
                {hasPendingChange && (
                  <Input
                    type="number"
                    step="0.01"
                    value={pendingChangeValue}
                    onChange={(e) => setPendingChangeValue(e.target.value)}
                    placeholder="Valor do troco"
                    className="w-32"
                  />
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  !selectedOperatorId ||
                  restaurants.length === 0
                }
              >
                {createMutation.isPending ? (
                  "Abrindo caixa..."
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Abrir Caixa PDV
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddCashRegisterDialog;
