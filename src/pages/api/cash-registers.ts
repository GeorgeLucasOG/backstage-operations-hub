import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

// Cria uma instância do Supabase com o service role para operações privilegiadas
// IMPORTANTE: Este cliente tem acesso completo ao banco de dados, use com cuidado!
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Método GET para buscar registros
  if (req.method === "GET") {
    try {
      // Buscar todos os registros de caixa
      const { data, error } = await supabaseAdmin
        .from("CashRegisters")
        .select("*")
        .order("createdat", { ascending: false });

      if (error) {
        console.error("Admin API error (GET):", error);
        return res.status(500).json({
          message: `Service role failed to retrieve cash registers: ${error.message}`,
          details: error,
        });
      }

      // Retornar os registros encontrados
      return res.status(200).json(data);
    } catch (error) {
      console.error("Server error (GET):", error);
      return res.status(500).json({
        message: "Failed to retrieve cash registers",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Método POST para criar registro
  if (req.method === "POST") {
    try {
      // Obter dados do corpo da requisição
      const {
        name,
        initialamount,
        currentamount,
        status,
        restaurantid,
        openedat,
        createdat,
      } = req.body;

      // Validar dados obrigatórios
      if (!name || initialamount === undefined || !status || !restaurantid) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Inserir o registro de caixa usando o cliente admin
      const { data, error } = await supabaseAdmin
        .from("CashRegisters")
        .insert([
          {
            name,
            initialamount,
            currentamount: currentamount || initialamount,
            status,
            restaurantid,
            openedat: openedat || new Date().toISOString(),
            createdat: createdat || new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Admin API error (POST):", error);
        return res.status(500).json({
          message: `Service role also failed: ${error.message}`,
          details: error,
        });
      }

      // Retornar o registro criado
      return res.status(200).json(data[0]);
    } catch (error) {
      console.error("Server error (POST):", error);
      return res.status(500).json({
        message: "Failed to create cash register",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Se chegou aqui, o método não é suportado
  return res.status(405).json({ message: "Method not allowed" });
}
