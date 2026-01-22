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
      categories: {
        Row: {
          code: string
          created_at: string
          default_making_charge_type:
            | Database["public"]["Enums"]["making_charge_type"]
            | null
          default_making_charge_value: number | null
          description: string | null
          display_order: number | null
          hsn_code: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          default_making_charge_type?:
            | Database["public"]["Enums"]["making_charge_type"]
            | null
          default_making_charge_value?: number | null
          description?: string | null
          display_order?: number | null
          hsn_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          default_making_charge_type?:
            | Database["public"]["Enums"]["making_charge_type"]
            | null
          default_making_charge_value?: number | null
          description?: string | null
          display_order?: number | null
          hsn_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
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
      product_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stones: {
        Row: {
          carat_weight: number | null
          certificate_number: string | null
          certification: string | null
          clarity: string | null
          color: string | null
          created_at: string
          cut: string | null
          id: string
          product_id: string
          stone_count: number
          stone_shape: string | null
          stone_type: string
          stone_value: number
        }
        Insert: {
          carat_weight?: number | null
          certificate_number?: string | null
          certification?: string | null
          clarity?: string | null
          color?: string | null
          created_at?: string
          cut?: string | null
          id?: string
          product_id: string
          stone_count?: number
          stone_shape?: string | null
          stone_type: string
          stone_value?: number
        }
        Update: {
          carat_weight?: number | null
          certificate_number?: string | null
          certification?: string | null
          clarity?: string | null
          color?: string | null
          created_at?: string
          cut?: string | null
          id?: string
          product_id?: string
          stone_count?: number
          stone_shape?: string | null
          stone_type?: string
          stone_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_stones_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          branch_id: string
          category_id: string
          created_at: string
          created_by: string | null
          description: string | null
          gross_weight: number
          hallmark_center: string | null
          hallmark_date: string | null
          has_stones: boolean | null
          huid: string | null
          id: string
          is_featured: boolean | null
          is_hallmarked: boolean | null
          is_published: boolean | null
          item_code: string
          location: string | null
          making_charge_amount: number | null
          making_charge_type: Database["public"]["Enums"]["making_charge_type"]
          making_charge_value: number
          metal_color: Database["public"]["Enums"]["metal_color"] | null
          metal_type: Database["public"]["Enums"]["metal_type"]
          metal_value: number | null
          mrp: number | null
          name: string
          net_weight: number
          purchase_date: string | null
          purchase_invoice: string | null
          purity: string
          status: Database["public"]["Enums"]["product_status"]
          stone_count: number | null
          stone_value: number | null
          stone_weight: number | null
          sub_category_id: string | null
          supplier_id: string | null
          total_cost: number | null
          total_weight: number | null
          updated_at: string
          updated_by: string | null
          wastage_percent: number | null
          wastage_weight: number | null
          wholesale_price: number | null
        }
        Insert: {
          barcode?: string | null
          branch_id: string
          category_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          gross_weight: number
          hallmark_center?: string | null
          hallmark_date?: string | null
          has_stones?: boolean | null
          huid?: string | null
          id?: string
          is_featured?: boolean | null
          is_hallmarked?: boolean | null
          is_published?: boolean | null
          item_code: string
          location?: string | null
          making_charge_amount?: number | null
          making_charge_type?: Database["public"]["Enums"]["making_charge_type"]
          making_charge_value?: number
          metal_color?: Database["public"]["Enums"]["metal_color"] | null
          metal_type?: Database["public"]["Enums"]["metal_type"]
          metal_value?: number | null
          mrp?: number | null
          name: string
          net_weight: number
          purchase_date?: string | null
          purchase_invoice?: string | null
          purity: string
          status?: Database["public"]["Enums"]["product_status"]
          stone_count?: number | null
          stone_value?: number | null
          stone_weight?: number | null
          sub_category_id?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          total_weight?: number | null
          updated_at?: string
          updated_by?: string | null
          wastage_percent?: number | null
          wastage_weight?: number | null
          wholesale_price?: number | null
        }
        Update: {
          barcode?: string | null
          branch_id?: string
          category_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          gross_weight?: number
          hallmark_center?: string | null
          hallmark_date?: string | null
          has_stones?: boolean | null
          huid?: string | null
          id?: string
          is_featured?: boolean | null
          is_hallmarked?: boolean | null
          is_published?: boolean | null
          item_code?: string
          location?: string | null
          making_charge_amount?: number | null
          making_charge_type?: Database["public"]["Enums"]["making_charge_type"]
          making_charge_value?: number
          metal_color?: Database["public"]["Enums"]["metal_color"] | null
          metal_type?: Database["public"]["Enums"]["metal_type"]
          metal_value?: number | null
          mrp?: number | null
          name?: string
          net_weight?: number
          purchase_date?: string | null
          purchase_invoice?: string | null
          purity?: string
          status?: Database["public"]["Enums"]["product_status"]
          stone_count?: number | null
          stone_value?: number | null
          stone_weight?: number | null
          sub_category_id?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          total_weight?: number | null
          updated_at?: string
          updated_by?: string | null
          wastage_percent?: number | null
          wastage_weight?: number | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
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
      stock_movements: {
        Row: {
          branch_id: string
          created_at: string
          created_by: string | null
          from_location: string | null
          id: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          to_location: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          created_by?: string | null
          from_location?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id: string
          quantity?: number
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          to_location?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          created_by?: string | null
          from_location?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          to_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_categories: {
        Row: {
          category_id: string
          code: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          code: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
      making_charge_type: "per_gram" | "percentage" | "flat"
      metal_color: "yellow" | "white" | "rose" | "two_tone" | "tri_tone"
      metal_type: "gold" | "silver" | "platinum" | "palladium"
      product_status:
        | "in_stock"
        | "sold"
        | "on_approval"
        | "with_karigar"
        | "in_repair"
        | "melted"
      silver_purity: "999" | "925" | "900" | "800"
      stock_movement_type:
        | "purchase"
        | "sale"
        | "transfer_in"
        | "transfer_out"
        | "adjustment"
        | "karigar_issue"
        | "karigar_receipt"
        | "return"
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
      making_charge_type: ["per_gram", "percentage", "flat"],
      metal_color: ["yellow", "white", "rose", "two_tone", "tri_tone"],
      metal_type: ["gold", "silver", "platinum", "palladium"],
      product_status: [
        "in_stock",
        "sold",
        "on_approval",
        "with_karigar",
        "in_repair",
        "melted",
      ],
      silver_purity: ["999", "925", "900", "800"],
      stock_movement_type: [
        "purchase",
        "sale",
        "transfer_in",
        "transfer_out",
        "adjustment",
        "karigar_issue",
        "karigar_receipt",
        "return",
      ],
    },
  },
} as const
