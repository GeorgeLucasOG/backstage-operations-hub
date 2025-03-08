
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import { CashRegister, CashMovement } from "../types";

// CashRegister related operations
export const fetchCashRegisters = async (): Promise<CashRegister[]> => {
  const { data, error } = await supabase
    .from("CashRegisters")
    .select("*")
    .order("createdat", { ascending: false });

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
        initialamount: initialAmount,
        currentamount: initialAmount,
        status: "OPEN",
        restaurantid: DEFAULT_RESTAURANT_ID,
        openedat: new Date().toISOString(),
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
      closedat: new Date().toISOString(),
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
    .eq("cashregisterid", cashRegisterId)
    .order("createdat", { ascending: false });

  if (error) {
    console.error("Error fetching cash movements:", error);
    throw new Error("Failed to load cash movements");
  }

  return data as CashMovement[];
};

export const createCashMovement = async (
  movement: {
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    paymentmethod: string;
    cashregisterid: string;
    restaurantid: string;
    orderid: number | null;
  }
): Promise<CashMovement> => {
  const { data, error } = await supabase
    .from("CashMovements")
    .insert([movement])
    .select();

  if (error) {
    console.error("Error creating cash movement:", error);
    throw new Error(`Failed to create cash movement: ${error.message}`);
  }

  // Update the currentAmount of the cash register
  const { error: updateError } = await supabase
    .from("CashRegisters")
    .update({
      currentamount: supabase.rpc("calculate_new_amount", {
        register_id: movement.cashregisterid,
        amount: movement.amount,
        is_income: movement.type === "INCOME"
      })
    })
    .eq("id", movement.cashregisterid);

  if (updateError) {
    console.error("Error updating cash register balance:", updateError);
    throw new Error(`Failed to update cash register balance: ${updateError.message}`);
  }

  return data[0] as CashMovement;
};
