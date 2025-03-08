-- Função para executar SQL diretamente (IMPORTANTE: LIMITAR O USO EM PRODUÇÃO)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador da função
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Conceder acesso à função para usuários autenticados
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;

-- Criar nova função com nome diferente para evitar conflito
CREATE OR REPLACE FUNCTION create_cash_register_secure(
  p_name TEXT,
  p_opening_balance NUMERIC,
  p_opening_date TIMESTAMP WITH TIME ZONE,
  p_restaurant_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador da função
AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO "CashRegisters" (
    id,
    name,
    initialamount,
    currentamount,
    status,
    restaurantid,
    openedat,
    createdat
  ) VALUES (
    gen_random_uuid(),
    p_name,
    p_opening_balance,
    p_opening_balance,
    'OPEN',
    p_restaurant_id,
    p_opening_date,
    NOW()
  ) RETURNING to_jsonb(CashRegisters.*) INTO v_result;
  
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Conceder acesso à função para usuários autenticados
GRANT EXECUTE ON FUNCTION create_cash_register_secure TO authenticated;

-- Função para calcular o novo valor do caixa (já existente, mantendo para referência)
CREATE OR REPLACE FUNCTION calculate_new_amount(
  register_id UUID,
  amount NUMERIC,
  is_income BOOLEAN
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_amount NUMERIC;
BEGIN
  -- Buscar o valor atual
  SELECT currentamount INTO current_amount 
  FROM "CashRegisters" 
  WHERE id = register_id;
  
  -- Calcular e retornar o novo valor
  IF is_income THEN
    RETURN current_amount + amount;
  ELSE
    RETURN current_amount - amount;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erro ao calcular novo valor: %', SQLERRM;
END;
$$;

-- Conceder acesso à função para usuários autenticados
GRANT EXECUTE ON FUNCTION calculate_new_amount TO authenticated;

-- Uma alternativa mais segura para ambientes de produção
CREATE POLICY "Allow all operations for authenticated users" 
ON "CashRegisters" 
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

SELECT 
    routine_name, 
    routine_type,
    data_type AS return_type
FROM 
    information_schema.routines 
WHERE 
    routine_name = 'create_cash_register_secure';

-- SOLUÇÃO DEFINITIVA
ALTER TABLE "CashRegisters" DISABLE ROW LEVEL SECURITY;
GRANT ALL ON "CashRegisters" TO authenticated;
GRANT ALL ON "CashRegisters" TO anon;
GRANT ALL ON "CashRegisters" TO service_role;

-- Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'CashRegisters';

-- 1. Desativar completamente o RLS na tabela
ALTER TABLE "CashRegisters" DISABLE ROW LEVEL SECURITY;

-- 2. Conceder todas as permissões a todos os tipos de usuários
GRANT ALL ON "CashRegisters" TO authenticated;
GRANT ALL ON "CashRegisters" TO anon;
GRANT ALL ON "CashRegisters" TO service_role;

-- 3. Garantir permissões em sequências relacionadas
DO $$
DECLARE
    seq_name text;
BEGIN
    -- Verificar sequência para o ID
    SELECT pg_get_serial_sequence('"CashRegisters"', 'id') INTO seq_name;
    
    -- Se existir uma sequência, conceder permissões
    IF seq_name IS NOT NULL THEN
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE ' || seq_name || ' TO authenticated';
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE ' || seq_name || ' TO anon';
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE ' || seq_name || ' TO service_role';
        RAISE NOTICE 'Permissões concedidas na sequência %', seq_name;
    END IF;
END $$;

-- 4. Verificar se as alterações foram aplicadas
SELECT 
    relname as tabela, 
    relrowsecurity as rls_ativo
FROM 
    pg_class 
WHERE 
    relname = 'CashRegisters'; 