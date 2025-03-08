import {
  supabase,
  DEFAULT_RESTAURANT_ID,
} from "@/integrations/supabase/client";
import { CashRegister, CashMovement } from "../types";

// Cache local para evitar múltiplas requisições
let cachedCashRegisters: CashRegister[] | null = null;
const CACHE_DURATION = 10 * 1000; // 10 segundos
let lastFetchTime = 0;

// Utilidades de cache
const isCacheValid = () => {
  return (
    cachedCashRegisters !== null && Date.now() - lastFetchTime < CACHE_DURATION
  );
};

const updateCache = (data: CashRegister[]) => {
  cachedCashRegisters = data;
  lastFetchTime = Date.now();
  console.log(`Cache atualizado com ${data.length} caixas`);
};

const invalidateCache = () => {
  cachedCashRegisters = null;
  lastFetchTime = 0;
  console.log("Cache de caixas invalidado");
};

// Interface para detalhes de abertura do caixa
export interface CashRegisterOpeningDetails {
  operatorId: string;
  operatorName: string;
  denominations: Array<{ name: string; value: number; count: number }>;
  hasPendingChange: boolean;
  pendingChangeValue: number;
}

// CashRegister related operations
export const fetchCashRegisters = async (
  forceRefresh = false
): Promise<CashRegister[]> => {
  console.log(
    "🔍 Iniciando busca de caixas...",
    forceRefresh ? "(forçando atualização)" : ""
  );

  // Sempre invalidar o cache se forceRefresh for true
  if (forceRefresh) {
    invalidateCache();
  }

  // Se o cache for válido e não forçamos atualização, use-o
  if (isCacheValid() && !forceRefresh) {
    console.log(
      `📦 Usando dados em cache. ${
        cachedCashRegisters?.length || 0
      } caixas encontrados.`
    );
    return cachedCashRegisters as CashRegister[];
  }

  // Número máximo de tentativas
  const MAX_RETRIES = 3;
  let currentTry = 0;
  let lastError = null;

  while (currentTry < MAX_RETRIES) {
    currentTry++;
    try {
      console.log(
        `🔄 Tentativa ${currentTry} de ${MAX_RETRIES} para buscar caixas`
      );

      // Garantir que temos a sessão mais recente
      if (forceRefresh) {
        await supabase.auth.refreshSession();
        console.log("🔐 Sessão atualizada para garantir autenticação recente");
      }

      // Tentativa com query simples primeiro
      const { data, error } = await supabase
        .from("CashRegisters")
        .select("*")
        .order("createdat", { ascending: false });

      if (error) {
        console.error(`❌ Erro na tentativa ${currentTry}:`, error);
        lastError = error;
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.error("❌ Dados inválidos recebidos:", data);
        throw new Error("Dados inválidos recebidos do servidor");
      }

      // Log detalhado dos dados recebidos
      console.log(
        `✅ Dados recebidos com sucesso. Total: ${data.length} caixas`
      );
      if (data.length > 0) {
        console.log("📋 Primeiro caixa:", {
          id: data[0].id,
          name: data[0].name,
          status: data[0].status,
        });
      }

      // Atualizar cache com os novos dados
      updateCache(data as CashRegister[]);
      return data as CashRegister[];
    } catch (err) {
      console.error(`❌ Exceção na tentativa ${currentTry}:`, err);
      lastError = err;

      if (currentTry < MAX_RETRIES) {
        const delay = 1000 * currentTry;
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Se todas as tentativas falharam, tentar uma última vez com uma query mais simples
  try {
    console.log("🆘 Tentando query de emergência...");
    const { data } = await supabase
      .from("CashRegisters")
      .select(
        "id, name, status, currentamount, initialamount, createdat, openedat"
      )
      .limit(100);

    if (data && Array.isArray(data) && data.length > 0) {
      console.log("✅ Query de emergência bem sucedida!");
      updateCache(data as CashRegister[]);
      return data as CashRegister[];
    }
  } catch (emergencyErr) {
    console.error("❌ Query de emergência falhou:", emergencyErr);
  }

  console.warn("⚠️ Nenhum dado encontrado após todas as tentativas");
  return [];
};

/**
 * Cria um novo caixa usando a função segura create_cash_register_secure
 */
export const createCashRegister = async (
  name: string,
  initialAmount: number,
  restaurantId: string = DEFAULT_RESTAURANT_ID,
  openingDetails?: CashRegisterOpeningDetails
): Promise<CashRegister> => {
  // Invalidar cache antes de criar
  invalidateCache();

  try {
    console.log(
      `🔵 Iniciando criação de caixa: "${name}" com valor inicial ${initialAmount}`
    );
    console.log(
      `🔵 Operador: ${openingDetails?.operatorName || "Não informado"}`
    );
    console.log(`🔵 Restaurante ID: ${restaurantId}`);

    // Usar a função RPC segura que já existe no banco de dados
    console.log("⚡ Chamando função RPC create_cash_register_secure...");

    // Timestamp atual para a data de abertura
    const openingDate = new Date().toISOString();

    // @ts-expect-error - A função RPC não está tipada no schema do Supabase
    const { data, error } = await supabase.rpc("create_cash_register_secure", {
      p_name: name,
      p_opening_balance: initialAmount, // Nome correto do parâmetro
      p_opening_date: openingDate, // Parâmetro obrigatório que estava faltando
      p_restaurant_id: restaurantId,
    });

    if (error) {
      console.error("❌ Erro ao chamar função RPC:", error);

      // Se a função falhar, usar abordagem direta
      console.log("⚡ Tentando abordagem direta...");

      const { data: directData, error: directError } = await supabase
        .from("CashRegisters")
        .insert([
          {
            name: name,
            initialamount: initialAmount,
            currentamount: initialAmount,
            status: "OPEN",
            restaurantid: restaurantId,
            openedat: new Date().toISOString(),
            createdat: new Date().toISOString(),
          },
        ])
        .select();

      if (directError || !directData || directData.length === 0) {
        console.error(
          "❌ Falha na inserção direta:",
          directError || "Sem dados retornados"
        );
        throw new Error(
          `Falha ao criar caixa: ${
            directError?.message || "Motivo desconhecido"
          }`
        );
      }

      console.log("✅ Caixa criado com sucesso via inserção direta!");

      // Apenas invalidar o cache local, sem tentar recarregar
      invalidateCache();

      return directData[0] as CashRegister;
    }

    if (!data) {
      console.error("❌ Função RPC não retornou dados");
      throw new Error("Função RPC não retornou dados");
    }

    console.log("✅ Caixa criado com sucesso via função RPC!");
    console.log("📋 Dados retornados:", data);

    // Apenas invalidar o cache local, sem tentar recarregar
    invalidateCache();

    return data as unknown as CashRegister;
  } catch (err: unknown) {
    console.error("🔴 Erro ao criar caixa:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Erro desconhecido";
    throw new Error(`Failed to create crash register: ${errorMessage}`);
  }
};

export const closeCashRegister = async (id: string): Promise<CashRegister> => {
  // Invalidar cache antes de fechar o caixa
  invalidateCache();

  try {
    const { data, error } = await supabase
      .from("CashRegisters")
      .update({
        status: "CLOSED",
        closedat: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error closing cash register:", error);
      throw new Error(`Failed to close cash register: ${error.message}`);
    }

    // Invalidar cache após fechar o caixa
    invalidateCache();
    return data[0] as CashRegister;
  } catch (err) {
    console.error("Exception closing cash register:", err);
    throw new Error(
      err instanceof Error ? err.message : "Unknown error closing cash register"
    );
  }
};

// CashMovement related operations
export const fetchCashMovements = async (
  cashRegisterId: string
): Promise<CashMovement[]> => {
  try {
    const { data, error } = await supabase
      .from("CashMovements")
      .select("*")
      .eq("cashregisterid", cashRegisterId)
      .order("createdat", { ascending: false });

    if (error) {
      console.error("Error fetching cash movements:", error);
      throw new Error("Failed to load cash movements");
    }

    return data as CashMovement[];
  } catch (err) {
    console.error("Exception fetching cash movements:", err);
    return [];
  }
};

export const createCashMovement = async (movement: {
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  paymentmethod: string;
  cashregisterid: string;
  restaurantid: string;
  orderid: number | null;
}): Promise<CashMovement> => {
  // Invalidar cache antes de criar o movimento
  invalidateCache();

  try {
    const { data, error } = await supabase
      .from("CashMovements")
      .insert([movement])
      .select();

    if (error) {
      console.error("Error creating cash movement:", error);
      throw new Error(`Failed to create cash movement: ${error.message}`);
    }

    // Update the currentAmount of the cash register
    const updateResponse = await supabase
      .from("CashRegisters")
      .update({
        currentamount: await calculateNewAmount(
          movement.cashregisterid,
          movement.amount,
          movement.type === "INCOME"
        ),
      })
      .eq("id", movement.cashregisterid);

    if (updateResponse.error) {
      console.error(
        "Error updating cash register balance:",
        updateResponse.error
      );
      throw new Error(
        `Failed to update cash register balance: ${updateResponse.error.message}`
      );
    }

    // Invalidar cache após criar o movimento
    invalidateCache();
    return data[0] as CashMovement;
  } catch (err) {
    console.error("Exception creating cash movement:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Unknown error creating cash movement"
    );
  }
};

// Função auxiliar para calcular novo valor do caixa
async function calculateNewAmount(
  registerId: string,
  amount: number,
  isIncome: boolean
): Promise<number> {
  // Busca o saldo atual
  try {
    const { data, error } = await supabase
      .from("CashRegisters")
      .select("currentamount")
      .eq("id", registerId)
      .single();

    if (error) {
      throw new Error(`Failed to get current amount: ${error.message}`);
    }

    const currentAmount = data?.currentamount || 0;
    return isIncome ? currentAmount + amount : currentAmount - amount;
  } catch (err) {
    console.error("Exception calculating new amount:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Unknown error calculating new amount"
    );
  }
}
