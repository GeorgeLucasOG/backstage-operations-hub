-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'pdv', 'monitor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de relação entre usuários e restaurantes
CREATE TABLE IF NOT EXISTS "UserRestaurant" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_restaurant_user_id ON "UserRestaurant"(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restaurant_restaurant_id ON "UserRestaurant"(restaurant_id);

-- Adicionar comentários para melhor documentação
COMMENT ON TABLE "User" IS 'Tabela de usuários do sistema';
COMMENT ON TABLE "UserRestaurant" IS 'Tabela de relação entre usuários e restaurantes';

-- Renomear a coluna password_hash para password
ALTER TABLE "User" RENAME COLUMN password_hash TO password;

-- Forçar atualização do cache de esquema
NOTIFY pgrst, 'reload schema'; 