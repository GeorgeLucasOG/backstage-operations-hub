-- Função para criar caixas com privilégios elevados
-- Execute esta função no editor SQL do Supabase
CREATE OR REPLACE FUNCTION create_cash_register(
  p_name TEXT,
  p_opening_balance NUMERIC,
  p_opening_date TIMESTAMP WITH TIME ZONE,
  p_restaurant_id TEXT
) RETURNS "CashRegisters" AS $$
DECLARE
  v_result "CashRegisters";
BEGIN
  INSERT INTO "CashRegisters" (
    "id",
    "name",
    "initialamount",
    "currentamount",
    "status",
    "restaurantid",
    "openedat",
    "createdat"
  ) VALUES (
    gen_random_uuid(),
    p_name,
    p_opening_balance,
    p_opening_balance,
    'OPEN',
    p_restaurant_id,
    p_opening_date,
    NOW()
  ) RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão para executar a função
GRANT EXECUTE ON FUNCTION create_cash_register TO authenticated;
GRANT EXECUTE ON FUNCTION create_cash_register TO anon; 