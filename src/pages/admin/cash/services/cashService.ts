
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import { CashRegister, CashMovement } from "../types";

// CashRegister related operations
export const fetchCashRegisters = async (): Promise<CashRegister[]> => {
  const { data, error } = await supabase
    .from("CashRegisters")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching cash registers:", error);
    throw new Error("Failed to load cash registers");
  }

  return data as CashRegister[];
};

export const createCashRegister = async (
  name: string,
  initialAmount: number
): Promise<CashRegister> => {
  const { data, error } = await supabase
    .from("CashRegisters")
    .insert([
      {
        name,
        initialAmount,
        currentAmount: initialAmount,
        status: "OPEN",
        restaurantId: DEFAULT_RESTAURANT_ID,
        openedAt: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error("Error creating cash register:", error);
    throw new Error(`Failed to create cash register: ${error.message}`);
  }

  return data[0] as CashRegister;
};

export const closeCashRegister = async (id: string): Promise<CashRegister> => {
  const { data, error } = await supabase
    .from("CashRegisters")
    .update({
      status: "CLOSED",
      closedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error closing cash register:", error);
    throw new Error(`Failed to close cash register: ${error.message}`);
  }

  return data[0] as CashRegister;
};

// CashMovement related operations
export const fetchCashMovements = async (cashRegisterId: string): Promise<CashMovement[]> => {
  const { data, error } = await supabase
    .from("CashMovements")
    .select("*")
    .eq("cashRegisterId", cashRegisterId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching cash movements:", error);
    throw new Error("Failed to load cash movements");
  }

  return data as CashMovement[];
};

export const createCashMovement = async (
  movement: Omit<CashMovement, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CashMovement> => {
  const { data, error } = await supabase
    .from("CashMovements")
    .insert([{
      ...movement,
      restaurantId: DEFAULT_RESTAURANT_ID,
    }])
    .select();

  if (error) {
    console.error("Error creating cash movement:", error);
    throw new Error(`Failed to create cash movement: ${error.message}`);
  }

  // Update the currentAmount of the cash register
  const { error: updateError } = await supabase
    .from("CashRegisters")
    .update({
      currentAmount: supabase.rpc("calculate_new_amount", {
        register_id: movement.cashRegisterId,
        amount: movement.amount,
        is_income: movement.type === "INCOME"
      })
    })
    .eq("id", movement.cashRegisterId);

  if (updateError) {
    console.error("Error updating cash register balance:", updateError);
    throw new Error(`Failed to update cash register balance: ${updateError.message}`);
  }

  return data[0] as CashMovement;
};
