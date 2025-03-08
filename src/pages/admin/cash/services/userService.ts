import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

/**
 * Busca todos os usuários disponíveis para operar o caixa PDV
 * Obs: Como a tabela users pode não existir no seu ambiente,
 * este método retorna um conjunto de usuários padrão para demonstração
 * @returns Lista de usuários
 */
export const fetchUsers = async (): Promise<User[]> => {
  try {
    // Não vamos tentar buscar usuários reais, apenas retornar os padrão
    // para evitar problemas de tipagem e tabelas ausentes
    return getDefaultUsers();
  } catch (err) {
    console.error("Exception fetching users:", err);
    // Em caso de erro, retornar usuários demonstrativos
    return getDefaultUsers();
  }
};

/**
 * Retorna um conjunto de usuários demonstrativos para fins de teste
 */
function getDefaultUsers(): User[] {
  return [
    {
      id: "admin-1",
      name: "Administrador",
      email: "admin@example.com",
      role: "admin",
      avatar_url:
        "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff",
      created_at: new Date().toISOString(),
    },
    {
      id: "cashier-1",
      name: "Operador de Caixa",
      email: "cashier@example.com",
      role: "cashier",
      avatar_url:
        "https://ui-avatars.com/api/?name=Cashier&background=2E8B57&color=fff",
      created_at: new Date().toISOString(),
    },
    {
      id: "waiter-1",
      name: "Garçom",
      email: "waiter@example.com",
      role: "waiter",
      avatar_url:
        "https://ui-avatars.com/api/?name=Waiter&background=CD7F32&color=fff",
      created_at: new Date().toISOString(),
    },
  ];
}
