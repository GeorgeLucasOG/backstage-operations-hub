import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCashRegisters,
  closeCashRegister,
} from "./cash/services/cashService";
import { CashRegister } from "./cash/types";
import AddCashRegisterDialog from "./cash/components/AddCashRegisterDialog";
import CashRegistersTable from "./cash/components/CashRegistersTable";
import CashRegisterDetailsDialog from "./cash/components/CashRegisterDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, PlusCircle, Store } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Cash = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] =
    useState<CashRegister | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const loadCashRegisters = useCallback(async () => {
    console.log("Executando loadCashRegisters...");
    try {
      const data = await fetchCashRegisters(true);
      console.log(`Caixas carregados com sucesso: ${data.length}`);
      return data;
    } catch (error) {
      console.error("Erro ao carregar caixas:", error);
      throw error;
    }
  }, []);

  const {
    data: cashRegistersData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["cashRegisters", manualRefreshCount],
    queryFn: loadCashRegisters,
    refetchOnWindowFocus: true,
    refetchInterval: autoRefreshEnabled ? 5000 : false,
    staleTime: 1000,
    retry: 3,
  });

  const openCashRegisters = cashRegistersData.filter(
    (register) => register.status === "OPEN"
  );

  useEffect(() => {
    console.log("🔄 Componente PDV montado, iniciando carga inicial...");

    const initialLoadTimeout = setTimeout(() => {
      refetch().then((result) => {
        if (result.isSuccess) {
          console.log(
            `✅ Carga inicial concluída: ${
              result.data?.length || 0
            } caixas encontrados`
          );
        } else {
          console.error("❌ Falha na carga inicial:", result.error);
        }
      });
    }, 300);

    return () => {
      clearTimeout(initialLoadTimeout);
      console.log("⏹️ Componente PDV desmontado, limpando timers");
    };
  }, [refetch]);

  useEffect(() => {
    if (forceUpdate > 0) {
      console.log(`🔄 Efeito de atualização forçada ativado (${forceUpdate})`);
      loadCashRegisters();
    }
  }, [forceUpdate, loadCashRegisters]);

  const closeMutation = useMutation({
    mutationFn: async (id: string) => {
      return closeCashRegister(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
      toast({
        title: "Sucesso",
        description: "Caixa PDV fechado com sucesso!",
      });

      setTimeout(() => {
        refetch();
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao fechar caixa",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (cashRegister: CashRegister) => {
    setSelectedCashRegister(cashRegister);
    setIsDetailsOpen(true);
  };

  const handleCloseCashRegister = (cashRegister: CashRegister) => {
    if (
      window.confirm(
        `Tem certeza que deseja fechar o caixa PDV "${cashRegister.name}"? Isso finalizará as operações neste terminal.`
      )
    ) {
      closeMutation.mutate(cashRegister.id);
    }
  };

  const handleRefreshData = () => {
    console.log("🔄 Forçando recarregamento dos dados dos caixas PDV...");

    queryClient.removeQueries({ queryKey: ["cashRegisters"] });
    setManualRefreshCount((prev) => prev + 1);

    toast({
      title: "Atualizando",
      description: "Atualizando lista de caixas...",
    });

    setTimeout(() => {
      refetch().then((result) => {
        if (result.isSuccess) {
          console.log(
            `✅ Recarregamento concluído: ${
              result.data?.length || 0
            } caixas encontrados`
          );
          toast({
            title: "Atualizado",
            description: `${result.data?.length || 0} caixas encontrados`,
          });
        } else {
          console.error("❌ Falha no recarregamento:", result.error);
          toast({
            title: "Erro",
            description: "Falha ao atualizar. Tente novamente.",
            variant: "destructive",
          });
        }
      });
    }, 100);
  };

  const forceComponentUpdate = () => {
    const newValue = forceUpdate + 1;
    console.log(`⚡ Forçando atualização do componente: ${newValue}`);
    setForceUpdate(newValue);
  };

  const handleCashRegisterCreated = async () => {
    console.log("🆕 Novo caixa criado, iniciando processo de atualização...");

    try {
      // 1. Invalidar queries e forçar atualização imediata
      await queryClient.invalidateQueries({ queryKey: ["cashRegisters"] });
      console.log("✅ Cache do React Query invalidado");

      // 2. Tentar buscar dados atualizados
      const fetchUpdatedData = async () => {
        try {
          const freshData = await fetchCashRegisters(true);
          console.log(
            "📋 Dados atualizados:",
            freshData?.length || 0,
            "caixas encontrados"
          );

          if (freshData && freshData.length > 0) {
            setCashRegisters(freshData);
            console.log("✅ Estado cashRegisters atualizado com sucesso");
            setForceUpdate((prev) => prev + 1);

            toast({
              title: "Sucesso!",
              description: "Caixa criado e lista atualizada com sucesso!",
            });

            return true;
          }
          console.warn("⚠️ Nenhum dado encontrado na atualização");
          return false;
        } catch (err) {
          console.error("❌ Erro ao buscar dados atualizados:", err);
          return false;
        }
      };

      // 3. Tentar atualizar imediatamente
      const immediate = await fetchUpdatedData();
      if (!immediate) {
        console.log(
          "⏳ Primeira tentativa não retornou dados, agendando retry..."
        );

        // 4. Se não obtiver dados imediatamente, tentar novamente após um delay
        setTimeout(async () => {
          const delayed = await fetchUpdatedData();
          if (!delayed) {
            console.log("🔄 Nenhum dado após retry, forçando reload...");
            window.location.reload();
          }
        }, 1500);
      }

      // 5. Forçar refetch do React Query em paralelo
      refetch().catch((err) => {
        console.error("❌ Erro no refetch do React Query:", err);
      });
    } catch (err) {
      console.error("❌ Erro no processo de atualização:", err);
      toast({
        title: "Atenção",
        description:
          "O caixa foi criado mas a lista pode demorar para atualizar.",
        variant: "destructive",
      });
    }
  };

  console.log(
    `🔍 Renderizando componente PDV. Total de caixas: ${cashRegisters.length}, Abertos: ${openCashRegisters.length}`
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            Sistema de Ponto de Vendas (PDV)
          </h1>
          <p className="text-muted-foreground">
            Gerencie os caixas e registre as operações financeiras do seu
            negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            title="Atualizar lista"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <AddCashRegisterDialog onSuccess={handleCashRegisterCreated} />
        </div>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar os caixas</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a lista de caixas. Por favor, tente
            novamente.
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Caixas</CardTitle>
            <CardDescription>Todos os caixas registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cashRegisters.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Caixas Abertos</CardTitle>
            <CardDescription>Caixas em operação</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {openCashRegisters.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fluxo Atual</CardTitle>
            <CardDescription>Saldo total em caixas abertos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              R${" "}
              {openCashRegisters
                .reduce((total, register) => total + register.currentamount, 0)
                .toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Caixas Disponíveis</h2>
        <CashRegistersTable
          cashRegisters={cashRegisters}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onCloseCashRegister={handleCloseCashRegister}
        />
      </div>

      {selectedCashRegister && (
        <CashRegisterDetailsDialog
          cashRegister={selectedCashRegister}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onCashRegisterClosed={handleRefreshData}
        />
      )}
    </div>
  );
};

export default Cash;
