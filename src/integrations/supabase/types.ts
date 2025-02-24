export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount: number
          boleto_code: string | null
          created_at: string | null
          description: string
          due_date: string
          id: string
          paid_date: string | null
          pix_key: string | null
          restaurant_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          boleto_code?: string | null
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          paid_date?: string | null
          pix_key?: string | null
          restaurant_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          boleto_code?: string | null
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          pix_key?: string | null
          restaurant_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          boleto_code: string | null
          created_at: string | null
          description: string
          due_date: string
          id: string
          pix_key: string | null
          received_date: string | null
          restaurant_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          boleto_code?: string | null
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          pix_key?: string | null
          received_date?: string | null
          restaurant_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          boleto_code?: string | null
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          pix_key?: string | null
          received_date?: string | null
          restaurant_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_movements: {
        Row: {
          amount: number
          cash_register_id: string
          created_at: string | null
          description: string
          id: string
          order_id: number | null
          payment_method: string
          restaurant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          cash_register_id: string
          created_at?: string | null
          description: string
          id?: string
          order_id?: number | null
          payment_method: string
          restaurant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cash_register_id?: string
          created_at?: string | null
          description?: string
          id?: string
          order_id?: number | null
          payment_method?: string
          restaurant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          closed_at: string | null
          created_at: string | null
          current_amount: number
          id: string
          initial_amount: number
          name: string
          opened_at: string | null
          restaurant_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          current_amount?: number
          id?: string
          initial_amount?: number
          name: string
          opened_at?: string | null
          restaurant_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          current_amount?: number
          id?: string
          initial_amount?: number
          name?: string
          opened_at?: string | null
          restaurant_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string | null
          id: string
          min_quantity: number
          name: string
          quantity: number
          restaurant_id: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          min_quantity?: number
          name: string
          quantity?: number
          restaurant_id: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          min_quantity?: number
          name?: string
          quantity?: number
          restaurant_id?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_products: {
        Row: {
          created_at: string | null
          id: string
          order_id: number
          price: number
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: number
          price: number
          product_id: string
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: number
          price?: number
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          consumption_method: Database["public"]["Enums"]["consumption_method"]
          created_at: string | null
          customer_cpf: string
          customer_name: string
          id: number
          restaurant_id: string
          status: Database["public"]["Enums"]["order_status"]
          table_number: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          consumption_method: Database["public"]["Enums"]["consumption_method"]
          created_at?: string | null
          customer_cpf: string
          customer_name: string
          id?: number
          restaurant_id: string
          status?: Database["public"]["Enums"]["order_status"]
          table_number?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          consumption_method?: Database["public"]["Enums"]["consumption_method"]
          created_at?: string | null
          customer_cpf?: string
          customer_name?: string
          id?: number
          restaurant_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          table_number?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string
          ingredients: string[]
          menu_category_id: string
          name: string
          price: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          ingredients: string[]
          menu_category_id: string
          name: string
          price: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          ingredients?: string[]
          menu_category_id?: string
          name?: string
          price?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_menu_category_id_fkey"
            columns: ["menu_category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          avatar_image_url: string
          cover_image_url: string
          created_at: string | null
          description: string
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          avatar_image_url: string
          cover_image_url: string
          created_at?: string | null
          description: string
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          avatar_image_url?: string
          cover_image_url?: string
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          ingredient_id: string
          quantity: number
          restaurant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          ingredient_id: string
          quantity: number
          restaurant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          ingredient_id?: string
          quantity?: number
          restaurant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      consumption_method: "TAKEAWAY" | "DINE_IN"
      order_status: "PENDING" | "IN_PREPARATION" | "FINISHED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
