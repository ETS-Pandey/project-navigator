export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          address: string | null
          city: string | null
          code: string
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean
          is_main_branch: boolean
          name: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          is_main_branch?: boolean
          name: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          is_main_branch?: boolean
          name?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_rates: {
        Row: {
          branch_id: string
          created_at: string
          gold_14k_buy: number | null
          gold_14k_sell: number | null
          gold_18k_buy: number | null
          gold_18k_sell: number | null
          gold_22k_buy: number | null
          gold_22k_sell: number | null
          gold_24k_buy: number
          gold_24k_sell: number
          id: string
          platinum_buy: number | null
          platinum_sell: number | null
          rate_date: string
          set_by: string | null
          silver_925_buy: number | null
          silver_925_sell: number | null
          silver_999_buy: number | null
          silver_999_sell: number | null
          updated_at: string
          wholesale_discount_percent: number | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          gold_14k_buy?: number | null
          gold_14k_sell?: number | null
          gold_18k_buy?: number | null
          gold_18k_sell?: number | null
          gold_22k_buy?: number | null
          gold_22k_sell?: number | null
          gold_24k_buy: number
          gold_24k_sell: number
          id?: string
          platinum_buy?: number | null
          platinum_sell?: number | null
          rate_date?: string
          set_by?: string | null
          silver_925_buy?: number | null
          silver_925_sell?: number | null
          silver_999_buy?: number | null
          silver_999_sell?: number | null
          updated_at?: string
          wholesale_discount_percent?: number | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          gold_14k_buy?: number | null
          gold_14k_sell?: number | null
          gold_18k_buy?: number | null
          gold_18k_sell?: number | null
          gold_22k_buy?: number | null
          gold_22k_sell?: number | null
          gold_24k_buy?: number
          gold_24k_sell?: number
          id?: string
          platinum_buy?: number | null
          platinum_sell?: number | null
          rate_date?: string
          set_by?: string | null
          silver_925_buy?: number | null
          silver_925_sell?: number | null
          silver_999_buy?: number | null
          silver_999_sell?: number | null
          updated_at?: string
          wholesale_discount_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_rates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          daily_rate_id: string
          id: string
          metal_type: Database["public"]["Enums"]["metal_type"]
          new_buy_rate: number
          new_sell_rate: number
          old_buy_rate: number | null
          old_sell_rate: number | null
          purity: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          daily_rate_id: string
          id?: string
          metal_type: Database["public"]["Enums"]["metal_type"]
          new_buy_rate: number
          new_sell_rate: number
          old_buy_rate?: number | null
          old_sell_rate?: number | null
          purity: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          daily_rate_id?: string
          id?: string
          metal_type?: Database["public"]["Enums"]["metal_type"]
          new_buy_rate?: number
          new_sell_rate?: number
          old_buy_rate?: number | null
          old_sell_rate?: number | null
          purity?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_history_daily_rate_id_fkey"
            columns: ["daily_rate_id"]
            isOneToOne: false
            referencedRelation: "daily_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_branch_access: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_primary: boolean
          user_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          user_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_branch_access_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_primary_branch: { Args: { _user_id: string }; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_branch_access: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "branch_manager"
        | "accountant"
        | "sales_executive"
        | "loan_officer"
        | "appraiser"
        | "catalog_manager"
        | "karigar_admin"
        | "auditor"
        | "customer"
      gold_purity: "24K" | "22K" | "18K" | "14K" | "10K"
      metal_type: "gold" | "silver" | "platinum" | "palladium"
      silver_purity: "999" | "925" | "900" | "800"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "owner",
        "admin",
        "branch_manager",
        "accountant",
        "sales_executive",
        "loan_officer",
        "appraiser",
        "catalog_manager",
        "karigar_admin",
        "auditor",
        "customer",
      ],
      gold_purity: ["24K", "22K", "18K", "14K", "10K"],
      metal_type: ["gold", "silver", "platinum", "palladium"],
      silver_purity: ["999", "925", "900", "800"],
    },
  },
} as const
