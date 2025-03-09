import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("MenuCategory")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      return res.status(200).json(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Erro ao buscar categorias",
      });
    }
  } else {
    return res.status(405).json({ error: "Método não permitido" });
  }
}
