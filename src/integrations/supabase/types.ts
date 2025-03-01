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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      accounts_payable: {
        Row: {
          amount: number
          boleto_code: string | null
          createdAt: string | null
          description: string
          due_date: string
          id: string
          paid_date: string | null
          pix_key: string | null
          restaurantId: string
          status: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          boleto_code?: string | null
          createdAt?: string | null
          description: string
          due_date: string
          id?: string
          paid_date?: string | null
          pix_key?: string | null
          restaurantId: string
          status?: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          boleto_code?: string | null
          createdAt?: string | null
          description?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          pix_key?: string | null
          restaurantId?: string
          status?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          boleto_code: string | null
          createdAt: string | null
          description: string
          due_date: string
          id: string
          pix_key: string | null
          received_date: string | null
          restaurantId: string
          status: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          boleto_code?: string | null
          createdAt?: string | null
          description: string
          due_date: string
          id?: string
          pix_key?: string | null
          received_date?: string | null
          restaurantId: string
          status?: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          boleto_code?: string | null
          createdAt?: string | null
          description?: string
          due_date?: string
          id?: string
          pix_key?: string | null
          received_date?: string | null
          restaurantId?: string
          status?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_movements: {
        Row: {
          amount: number
          cash_register_id: string
          createdAt: string | null
          description: string
          id: string
          orderId: number | null
          payment_method: string
          restaurantId: string
          type: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          cash_register_id: string
          createdAt?: string | null
          description: string
          id?: string
          orderId?: number | null
          payment_method: string
          restaurantId: string
          type: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          cash_register_id?: string
          createdAt?: string | null
          description?: string
          id?: string
          orderId?: number | null
          payment_method?: string
          restaurantId?: string
          type?: string
          updatedAt?: string | null
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
            foreignKeyName: "cash_movements_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          closed_at: string | null
          createdAt: string | null
          current_amount: number
          id: string
          initial_amount: number
          name: string
          opened_at: string | null
          restaurantId: string
          status: string
          updatedAt: string | null
        }
        Insert: {
          closed_at?: string | null
          createdAt?: string | null
          current_amount?: number
          id?: string
          initial_amount?: number
          name: string
          opened_at?: string | null
          restaurantId: string
          status?: string
          updatedAt?: string | null
        }
        Update: {
          closed_at?: string | null
          createdAt?: string | null
          current_amount?: number
          id?: string
          initial_amount?: number
          name?: string
          opened_at?: string | null
          restaurantId?: string
          status?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          alert_threshold: number | null
          createdAt: string | null
          id: string
          min_quantity: number
          name: string
          quantity: number
          restaurantId: string
          supplier_id: string | null
          unit: string
          updatedAt: string | null
        }
        Insert: {
          alert_threshold?: number | null
          createdAt?: string | null
          id?: string
          min_quantity?: number
          name: string
          quantity?: number
          restaurantId: string
          supplier_id?: string | null
          unit: string
          updatedAt?: string | null
        }
        Update: {
          alert_threshold?: number | null
          createdAt?: string | null
          id?: string
          min_quantity?: number
          name?: string
          quantity?: number
          restaurantId?: string
          supplier_id?: string | null
          unit?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      MenuCategory: {
        Row: {
          createdAt: string | null
          id: string
          name: string
          restaurantId: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          id?: string
          name: string
          restaurantId: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          id?: string
          name?: string
          restaurantId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "MenuCategory_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      Order: {
        Row: {
          consumption_method: Database["public"]["Enums"]["consumption_method"]
          createdAt: string | null
          customer_cpf: string
          customer_name: string
          id: number
          restaurantId: string
          status: Database["public"]["Enums"]["order_status"]
          table_number: number | null
          total: number
          updatedAt: string | null
        }
        Insert: {
          consumption_method: Database["public"]["Enums"]["consumption_method"]
          createdAt?: string | null
          customer_cpf: string
          customer_name: string
          id?: number
          restaurantId: string
          status?: Database["public"]["Enums"]["order_status"]
          table_number?: number | null
          total: number
          updatedAt?: string | null
        }
        Update: {
          consumption_method?: Database["public"]["Enums"]["consumption_method"]
          createdAt?: string | null
          customer_cpf?: string
          customer_name?: string
          id?: number
          restaurantId?: string
          status?: Database["public"]["Enums"]["order_status"]
          table_number?: number | null
          total?: number
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Order_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      OrderProduct: {
        Row: {
          createdAt: string | null
          id: string
          orderId: number
          price: number
          productId: string
          quantity: number
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          id?: string
          orderId: number
          price: number
          productId: string
          quantity: number
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          id?: string
          orderId?: number
          price?: number
          productId?: string
          quantity?: number
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "OrderProduct_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrderProduct_productId_fkey"
            columns: ["productId"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          consumption_method: string
          created_at: string | null
          customer_cpf: string
          customer_name: string
          id: number
          restaurant_id: string
          status: string
          table_number: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          consumption_method: string
          created_at?: string | null
          customer_cpf: string
          customer_name: string
          id?: number
          restaurant_id: string
          status?: string
          table_number?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          consumption_method?: string
          created_at?: string | null
          customer_cpf?: string
          customer_name?: string
          id?: number
          restaurant_id?: string
          status?: string
          table_number?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      Product: {
        Row: {
          createdAt: string | null
          description: string
          id: string
          imageUrl: string
          ingredients: string[] | null
          menuCategoryId: string
          name: string
          price: number
          restaurantId: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          description: string
          id?: string
          imageUrl: string
          ingredients?: string[] | null
          menuCategoryId: string
          name: string
          price: number
          restaurantId: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          description?: string
          id?: string
          imageUrl?: string
          ingredients?: string[] | null
          menuCategoryId?: string
          name?: string
          price?: number
          restaurantId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Product_menuCategoryId_fkey"
            columns: ["menuCategoryId"]
            isOneToOne: false
            referencedRelation: "MenuCategory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Product_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
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
          ingredients: string[] | null
          menu_category_id: string | null
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
          ingredients?: string[] | null
          menu_category_id?: string | null
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
          ingredients?: string[] | null
          menu_category_id?: string | null
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
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      Restaurant: {
        Row: {
          avatarImageUrl: string
          coverImageUrl: string
          createdAt: string | null
          description: string
          id: string
          name: string
          slug: string
          updatedAt: string | null
        }
        Insert: {
          avatarImageUrl: string
          coverImageUrl: string
          createdAt?: string | null
          description: string
          id?: string
          name: string
          slug: string
          updatedAt?: string | null
        }
        Update: {
          avatarImageUrl?: string
          coverImageUrl?: string
          createdAt?: string | null
          description?: string
          id?: string
          name?: string
          slug?: string
          updatedAt?: string | null
        }
        Relationships: []
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
          createdAt: string | null
          description: string | null
          id: string
          ingredient_id: string
          quantity: number
          restaurantId: string
          type: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          description?: string | null
          id?: string
          ingredient_id: string
          quantity: number
          restaurantId: string
          type: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          description?: string | null
          id?: string
          ingredient_id?: string
          quantity?: number
          restaurantId?: string
          type?: string
          updatedAt?: string | null
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
            foreignKeyName: "stock_movements_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          cnpj: string | null
          company_name: string | null
          createdAt: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          restaurantId: string
          updatedAt: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          company_name?: string | null
          createdAt?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          restaurantId: string
          updatedAt?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          company_name?: string | null
          createdAt?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          restaurantId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      waiters: {
        Row: {
          createdAt: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          restaurantId: string
          status: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          restaurantId: string
          status?: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          restaurantId?: string
          status?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waiters_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      table_exists: {
        Args: {
          table_name: string
        }
        Returns: boolean
      }
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
