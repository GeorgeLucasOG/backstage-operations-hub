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
      AccountsPayable: {
        Row: {
          amount: number
          boletoCode: string | null
          createdAt: string
          description: string
          dueDate: string
          id: string
          paidDate: string | null
          pixKey: string | null
          restaurantId: string
          status: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          boletoCode?: string | null
          createdAt?: string
          description: string
          dueDate: string
          id?: string
          paidDate?: string | null
          pixKey?: string | null
          restaurantId: string
          status?: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          boletoCode?: string | null
          createdAt?: string
          description?: string
          dueDate?: string
          id?: string
          paidDate?: string | null
          pixKey?: string | null
          restaurantId?: string
          status?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AccountsPayable_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      AccountsReceivable: {
        Row: {
          amount: number
          boletoCode: string | null
          createdAt: string
          description: string
          dueDate: string
          id: string
          pixKey: string | null
          receivedDate: string | null
          restaurantId: string
          status: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          boletoCode?: string | null
          createdAt?: string
          description: string
          dueDate: string
          id?: string
          pixKey?: string | null
          receivedDate?: string | null
          restaurantId: string
          status?: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          boletoCode?: string | null
          createdAt?: string
          description?: string
          dueDate?: string
          id?: string
          pixKey?: string | null
          receivedDate?: string | null
          restaurantId?: string
          status?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AccountsReceivable_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      CashMovements: {
        Row: {
          amount: number
          cashRegisterId: string
          createdAt: string
          description: string
          id: string
          orderId: number | null
          paymentMethod: string
          restaurantId: string
          type: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          cashRegisterId: string
          createdAt?: string
          description: string
          id?: string
          orderId?: number | null
          paymentMethod: string
          restaurantId: string
          type: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          cashRegisterId?: string
          createdAt?: string
          description?: string
          id?: string
          orderId?: number | null
          paymentMethod?: string
          restaurantId?: string
          type?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "CashMovements_cashRegisterId_fkey"
            columns: ["cashRegisterId"]
            isOneToOne: false
            referencedRelation: "CashRegisters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CashMovements_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      CashRegisters: {
        Row: {
          closedAt: string | null
          createdAt: string
          currentAmount: number
          id: string
          initialAmount: number
          name: string
          openedAt: string | null
          restaurantId: string
          status: string
          updatedAt: string | null
        }
        Insert: {
          closedAt?: string | null
          createdAt?: string
          currentAmount: number
          id?: string
          initialAmount: number
          name: string
          openedAt?: string | null
          restaurantId: string
          status: string
          updatedAt?: string | null
        }
        Update: {
          closedAt?: string | null
          createdAt?: string
          currentAmount?: number
          id?: string
          initialAmount?: number
          name?: string
          openedAt?: string | null
          restaurantId?: string
          status?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "CashRegisters_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      Ingredients: {
        Row: {
          alertThreshold: number | null
          createdAt: string
          id: string
          minQuantity: number
          name: string
          quantity: number
          restaurantId: string
          supplierId: string | null
          unit: string
          updatedAt: string | null
        }
        Insert: {
          alertThreshold?: number | null
          createdAt?: string
          id?: string
          minQuantity?: number
          name: string
          quantity?: number
          restaurantId: string
          supplierId?: string | null
          unit: string
          updatedAt?: string | null
        }
        Update: {
          alertThreshold?: number | null
          createdAt?: string
          id?: string
          minQuantity?: number
          name?: string
          quantity?: number
          restaurantId?: string
          supplierId?: string | null
          unit?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Ingredients_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      MenuCategory: {
        Row: {
          createdAt: string
          id: string
          name: string
          restaurantId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          restaurantId: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          restaurantId?: string
          updatedAt?: string
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
          address: string | null
          consumptionMethod: Database["public"]["Enums"]["ConsumptionMethod"]
          createdAt: string
          customerCpf: string
          customerName: string
          id: number
          restaurantId: string
          status: Database["public"]["Enums"]["OrderStatus"]
          total: number
          updatedAt: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          consumptionMethod: Database["public"]["Enums"]["ConsumptionMethod"]
          createdAt?: string
          customerCpf: string
          customerName: string
          id?: number
          restaurantId: string
          status: Database["public"]["Enums"]["OrderStatus"]
          total: number
          updatedAt: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          consumptionMethod?: Database["public"]["Enums"]["ConsumptionMethod"]
          createdAt?: string
          customerCpf?: string
          customerName?: string
          id?: number
          restaurantId?: string
          status?: Database["public"]["Enums"]["OrderStatus"]
          total?: number
          updatedAt?: string
          whatsapp?: string | null
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
          createdAt: string
          id: string
          orderId: number
          price: number
          productId: string
          quantity: number
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          orderId: number
          price: number
          productId: string
          quantity: number
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          orderId?: number
          price?: number
          productId?: string
          quantity?: number
          updatedAt?: string
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
      Product: {
        Row: {
          createdAt: string
          description: string
          id: string
          imageUrl: string
          ingredients: string[] | null
          menuCategoryId: string
          name: string
          price: number
          restaurantId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description: string
          id: string
          imageUrl: string
          ingredients?: string[] | null
          menuCategoryId: string
          name: string
          price: number
          restaurantId: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string
          id?: string
          imageUrl?: string
          ingredients?: string[] | null
          menuCategoryId?: string
          name?: string
          price?: number
          restaurantId?: string
          updatedAt?: string
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
      Restaurant: {
        Row: {
          avatarImageUrl: string
          coverImageUrl: string
          createdAt: string
          description: string
          id: string
          name: string
          slug: string
          updatedAt: string
        }
        Insert: {
          avatarImageUrl: string
          coverImageUrl: string
          createdAt?: string
          description: string
          id: string
          name: string
          slug: string
          updatedAt: string
        }
        Update: {
          avatarImageUrl?: string
          coverImageUrl?: string
          createdAt?: string
          description?: string
          id?: string
          name?: string
          slug?: string
          updatedAt?: string
        }
        Relationships: []
      }
      StockMovements: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          ingredientId: string
          quantity: number
          restaurantId: string
          type: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id?: string
          ingredientId: string
          quantity: number
          restaurantId: string
          type: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          ingredientId?: string
          quantity?: number
          restaurantId?: string
          type?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "StockMovements_ingredientId_fkey"
            columns: ["ingredientId"]
            isOneToOne: false
            referencedRelation: "Ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StockMovements_restaurantId_fkey"
            columns: ["restaurantId"]
            isOneToOne: false
            referencedRelation: "Restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      Suppliers: {
        Row: {
          address: string | null
          cnpj: string | null
          companyName: string | null
          createdAt: string
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
          companyName?: string | null
          createdAt?: string
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
          companyName?: string | null
          createdAt?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          restaurantId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Suppliers_restaurantId_fkey"
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
      [_ in never]: never
    }
    Enums: {
      ConsumptionMethod: "TAKEAWAY" | "DINE_IN"
      OrderStatus: "PENDING" | "IN_PREPARATION" | "FINISHED"
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
