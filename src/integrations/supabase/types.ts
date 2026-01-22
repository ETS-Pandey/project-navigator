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
      business_settings: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string | null
          current_balance: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_account: boolean | null
          opening_balance: number | null
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          current_balance?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_account?: boolean | null
          opening_balance?: number | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          current_balance?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_account?: boolean | null
          opening_balance?: number | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_orders: {
        Row: {
          actual_weight: number | null
          advance_paid: number | null
          assigned_karigar: string | null
          balance_due: number | null
          branch_id: string
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_date: string | null
          design_description: string
          design_reference_url: string | null
          estimated_cost: number | null
          estimated_weight: number | null
          expected_date: string | null
          final_cost: number | null
          id: string
          metal_type: Database["public"]["Enums"]["metal_type"] | null
          notes: string | null
          order_date: string
          order_number: string
          purity: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actual_weight?: number | null
          advance_paid?: number | null
          assigned_karigar?: string | null
          balance_due?: number | null
          branch_id: string
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_date?: string | null
          design_description: string
          design_reference_url?: string | null
          estimated_cost?: number | null
          estimated_weight?: number | null
          expected_date?: string | null
          final_cost?: number | null
          id?: string
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          notes?: string | null
          order_date?: string
          order_number: string
          purity?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actual_weight?: number | null
          advance_paid?: number | null
          assigned_karigar?: string | null
          balance_due?: number | null
          branch_id?: string
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_date?: string | null
          design_description?: string
          design_reference_url?: string | null
          estimated_cost?: number | null
          estimated_weight?: number | null
          expected_date?: string | null
          final_cost?: number | null
          id?: string
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          notes?: string | null
          order_date?: string
          order_number?: string
          purity?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          aadhar: string | null
          address: string | null
          anniversary: string | null
          branch_id: string
          city: string | null
          created_at: string
          created_by: string | null
          credit_limit: number | null
          customer_code: string
          customer_type: string
          date_of_birth: string | null
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean
          loyalty_points: number | null
          name: string
          notes: string | null
          outstanding_balance: number | null
          pan: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aadhar?: string | null
          address?: string | null
          anniversary?: string | null
          branch_id: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          customer_code: string
          customer_type?: string
          date_of_birth?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          loyalty_points?: number | null
          name: string
          notes?: string | null
          outstanding_balance?: number | null
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aadhar?: string | null
          address?: string | null
          anniversary?: string | null
          branch_id?: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          customer_code?: string
          customer_type?: string
          date_of_birth?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          loyalty_points?: number | null
          name?: string
          notes?: string | null
          outstanding_balance?: number | null
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
      expense_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          branch_id: string
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expense_date: string
          expense_number: string
          gst_amount: number | null
          id: string
          is_gst_applicable: boolean | null
          payment_mode: Database["public"]["Enums"]["payment_mode"] | null
          reference_number: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          branch_id: string
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expense_date?: string
          expense_number: string
          gst_amount?: number | null
          id?: string
          is_gst_applicable?: boolean | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          branch_id?: string
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expense_date?: string
          expense_number?: string
          gst_amount?: number | null
          id?: string
          is_gst_applicable?: boolean | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          cgst_amount: number | null
          cgst_percent: number | null
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          display_order: number | null
          gross_weight: number | null
          hsn_code: string | null
          id: string
          igst_amount: number | null
          igst_percent: number | null
          invoice_id: string
          item_code: string | null
          item_name: string
          making_charge_type:
            | Database["public"]["Enums"]["making_charge_type"]
            | null
          making_charge_value: number | null
          making_charges: number | null
          metal_type: Database["public"]["Enums"]["metal_type"] | null
          metal_value: number | null
          net_weight: number | null
          other_charges: number | null
          product_id: string | null
          purity: string | null
          quantity: number
          rate_per_gram: number | null
          sgst_amount: number | null
          sgst_percent: number | null
          stone_value: number | null
          taxable_amount: number
          total_amount: number
          unit_price: number
        }
        Insert: {
          cgst_amount?: number | null
          cgst_percent?: number | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          display_order?: number | null
          gross_weight?: number | null
          hsn_code?: string | null
          id?: string
          igst_amount?: number | null
          igst_percent?: number | null
          invoice_id: string
          item_code?: string | null
          item_name: string
          making_charge_type?:
            | Database["public"]["Enums"]["making_charge_type"]
            | null
          making_charge_value?: number | null
          making_charges?: number | null
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          metal_value?: number | null
          net_weight?: number | null
          other_charges?: number | null
          product_id?: string | null
          purity?: string | null
          quantity?: number
          rate_per_gram?: number | null
          sgst_amount?: number | null
          sgst_percent?: number | null
          stone_value?: number | null
          taxable_amount?: number
          total_amount?: number
          unit_price?: number
        }
        Update: {
          cgst_amount?: number | null
          cgst_percent?: number | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          display_order?: number | null
          gross_weight?: number | null
          hsn_code?: string | null
          id?: string
          igst_amount?: number | null
          igst_percent?: number | null
          invoice_id?: string
          item_code?: string | null
          item_name?: string
          making_charge_type?:
            | Database["public"]["Enums"]["making_charge_type"]
            | null
          making_charge_value?: number | null
          making_charges?: number | null
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          metal_value?: number | null
          net_weight?: number | null
          other_charges?: number | null
          product_id?: string | null
          purity?: string | null
          quantity?: number
          rate_per_gram?: number | null
          sgst_amount?: number | null
          sgst_percent?: number | null
          stone_value?: number | null
          taxable_amount?: number
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          balance_due: number | null
          branch_id: string
          cgst_amount: number | null
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_gstin: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          discount_percent: number | null
          grand_total: number
          gross_amount: number
          id: string
          igst_amount: number | null
          invoice_date: string
          invoice_number: string
          invoice_type: string
          is_interstate: boolean | null
          notes: string | null
          old_gold_amount: number | null
          payment_due_date: string | null
          round_off: number | null
          sgst_amount: number | null
          status: Database["public"]["Enums"]["invoice_status"]
          taxable_amount: number
          terms_conditions: string | null
          total_gst: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount_paid?: number | null
          balance_due?: number | null
          branch_id: string
          cgst_amount?: number | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_gstin?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          grand_total?: number
          gross_amount?: number
          id?: string
          igst_amount?: number | null
          invoice_date?: string
          invoice_number: string
          invoice_type?: string
          is_interstate?: boolean | null
          notes?: string | null
          old_gold_amount?: number | null
          payment_due_date?: string | null
          round_off?: number | null
          sgst_amount?: number | null
          status?: Database["public"]["Enums"]["invoice_status"]
          taxable_amount?: number
          terms_conditions?: string | null
          total_gst?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount_paid?: number | null
          balance_due?: number | null
          branch_id?: string
          cgst_amount?: number | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_gstin?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          grand_total?: number
          gross_amount?: number
          id?: string
          igst_amount?: number | null
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string
          is_interstate?: boolean | null
          notes?: string | null
          old_gold_amount?: number | null
          payment_due_date?: string | null
          round_off?: number | null
          sgst_amount?: number | null
          status?: Database["public"]["Enums"]["invoice_status"]
          taxable_amount?: number
          terms_conditions?: string | null
          total_gst?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          entry_date: string
          entry_number: string
          id: string
          is_posted: boolean | null
          narration: string | null
          reference_id: string | null
          reference_type: string | null
          total_credit: number
          total_debit: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          entry_date?: string
          entry_number: string
          id?: string
          is_posted?: boolean | null
          narration?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          entry_date?: string
          entry_number?: string
          id?: string
          is_posted?: boolean | null
          narration?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string | null
          credit_amount: number | null
          debit_amount: number | null
          id: string
          journal_entry_id: string
          narration: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          id?: string
          journal_entry_id: string
          narration?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          id?: string
          journal_entry_id?: string
          narration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_collaterals: {
        Row: {
          created_at: string
          gross_weight: number
          id: string
          image_url: string | null
          is_released: boolean
          item_description: string
          item_value: number
          loan_id: string
          metal_type: Database["public"]["Enums"]["metal_type"]
          net_weight: number
          packet_number: string | null
          purity: string
          rate_per_gram: number
          released_at: string | null
          released_by: string | null
          stone_weight: number | null
          storage_location: string | null
        }
        Insert: {
          created_at?: string
          gross_weight: number
          id?: string
          image_url?: string | null
          is_released?: boolean
          item_description: string
          item_value: number
          loan_id: string
          metal_type?: Database["public"]["Enums"]["metal_type"]
          net_weight: number
          packet_number?: string | null
          purity: string
          rate_per_gram: number
          released_at?: string | null
          released_by?: string | null
          stone_weight?: number | null
          storage_location?: string | null
        }
        Update: {
          created_at?: string
          gross_weight?: number
          id?: string
          image_url?: string | null
          is_released?: boolean
          item_description?: string
          item_value?: number
          loan_id?: string
          metal_type?: Database["public"]["Enums"]["metal_type"]
          net_weight?: number
          packet_number?: string | null
          purity?: string
          rate_per_gram?: number
          released_at?: string | null
          released_by?: string | null
          stone_weight?: number | null
          storage_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_collaterals_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_interest_accruals: {
        Row: {
          accrual_date: string
          created_at: string
          cumulative_interest: number
          days_count: number
          id: string
          interest_amount: number
          interest_rate: number
          is_paid: boolean
          loan_id: string
          paid_in_payment_id: string | null
          principal_balance: number
        }
        Insert: {
          accrual_date: string
          created_at?: string
          cumulative_interest: number
          days_count?: number
          id?: string
          interest_amount: number
          interest_rate: number
          is_paid?: boolean
          loan_id: string
          paid_in_payment_id?: string | null
          principal_balance: number
        }
        Update: {
          accrual_date?: string
          created_at?: string
          cumulative_interest?: number
          days_count?: number
          id?: string
          interest_amount?: number
          interest_rate?: number
          is_paid?: boolean
          loan_id?: string
          paid_in_payment_id?: string | null
          principal_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "loan_interest_accruals_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_interest_accruals_paid_in_payment_id_fkey"
            columns: ["paid_in_payment_id"]
            isOneToOne: false
            referencedRelation: "loan_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          amount: number
          bank_name: string | null
          branch_id: string
          cheque_date: string | null
          cheque_number: string | null
          collateral_ids: string[] | null
          created_at: string
          created_by: string | null
          id: string
          interest_amount: number
          loan_id: string
          notes: string | null
          payment_date: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          payment_number: string
          payment_type: Database["public"]["Enums"]["loan_payment_type"]
          penalty_amount: number | null
          principal_amount: number
          receipt_printed: boolean
          reference_number: string | null
          upi_id: string | null
        }
        Insert: {
          amount: number
          bank_name?: string | null
          branch_id: string
          cheque_date?: string | null
          cheque_number?: string | null
          collateral_ids?: string[] | null
          created_at?: string
          created_by?: string | null
          id?: string
          interest_amount?: number
          loan_id: string
          notes?: string | null
          payment_date?: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          payment_number: string
          payment_type: Database["public"]["Enums"]["loan_payment_type"]
          penalty_amount?: number | null
          principal_amount?: number
          receipt_printed?: boolean
          reference_number?: string | null
          upi_id?: string | null
        }
        Update: {
          amount?: number
          bank_name?: string | null
          branch_id?: string
          cheque_date?: string | null
          cheque_number?: string | null
          collateral_ids?: string[] | null
          created_at?: string
          created_by?: string | null
          id?: string
          interest_amount?: number
          loan_id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          payment_number?: string
          payment_type?: Database["public"]["Enums"]["loan_payment_type"]
          penalty_amount?: number | null
          principal_amount?: number
          receipt_printed?: boolean
          reference_number?: string | null
          upi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          branch_id: string
          closed_by: string | null
          closed_date: string | null
          collateral_value: number
          created_at: string
          created_by: string | null
          customer_id: string
          due_date: string
          id: string
          interest_accrued: number
          interest_paid: number
          interest_rate: number
          interest_type: string
          loan_amount: number
          loan_date: string
          loan_number: string
          ltv_percent: number
          notes: string | null
          outstanding_interest: number
          outstanding_principal: number
          outstanding_total: number
          principal_paid: number
          renewed_from_loan_id: string | null
          renewed_to_loan_id: string | null
          status: Database["public"]["Enums"]["loan_status"]
          tenure_months: number
          terms_conditions: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          branch_id: string
          closed_by?: string | null
          closed_date?: string | null
          collateral_value: number
          created_at?: string
          created_by?: string | null
          customer_id: string
          due_date: string
          id?: string
          interest_accrued?: number
          interest_paid?: number
          interest_rate: number
          interest_type?: string
          loan_amount: number
          loan_date?: string
          loan_number: string
          ltv_percent: number
          notes?: string | null
          outstanding_interest?: number
          outstanding_principal: number
          outstanding_total: number
          principal_paid?: number
          renewed_from_loan_id?: string | null
          renewed_to_loan_id?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          tenure_months?: number
          terms_conditions?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          branch_id?: string
          closed_by?: string | null
          closed_date?: string | null
          collateral_value?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string
          due_date?: string
          id?: string
          interest_accrued?: number
          interest_paid?: number
          interest_rate?: number
          interest_type?: string
          loan_amount?: number
          loan_date?: string
          loan_number?: string
          ltv_percent?: number
          notes?: string | null
          outstanding_interest?: number
          outstanding_principal?: number
          outstanding_total?: number
          principal_paid?: number
          renewed_from_loan_id?: string | null
          renewed_to_loan_id?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          tenure_months?: number
          terms_conditions?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_renewed_from_loan_id_fkey"
            columns: ["renewed_from_loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_renewed_to_loan_id_fkey"
            columns: ["renewed_to_loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      old_gold_purchases: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          deduction_amount: number | null
          deduction_percent: number | null
          deduction_weight: number | null
          gross_value: number
          gross_weight: number
          id: string
          invoice_id: string | null
          metal_type: Database["public"]["Enums"]["metal_type"]
          net_value: number
          net_weight: number
          notes: string | null
          purchase_date: string
          purchase_number: string
          purity: string
          rate_per_gram: number
          status: string
          tested_by: string | null
          testing_method: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deduction_amount?: number | null
          deduction_percent?: number | null
          deduction_weight?: number | null
          gross_value: number
          gross_weight: number
          id?: string
          invoice_id?: string | null
          metal_type?: Database["public"]["Enums"]["metal_type"]
          net_value: number
          net_weight: number
          notes?: string | null
          purchase_date?: string
          purchase_number: string
          purity: string
          rate_per_gram: number
          status?: string
          tested_by?: string | null
          testing_method?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deduction_amount?: number | null
          deduction_percent?: number | null
          deduction_weight?: number | null
          gross_value?: number
          gross_weight?: number
          id?: string
          invoice_id?: string | null
          metal_type?: Database["public"]["Enums"]["metal_type"]
          net_value?: number
          net_weight?: number
          notes?: string | null
          purchase_date?: string
          purchase_number?: string
          purity?: string
          rate_per_gram?: number
          status?: string
          tested_by?: string | null
          testing_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "old_gold_purchases_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "old_gold_purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "old_gold_purchases_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bank_name: string | null
          branch_id: string
          cheque_date: string | null
          cheque_number: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          payment_number: string
          reference_number: string | null
          status: string
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          amount: number
          bank_name?: string | null
          branch_id: string
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          payment_number: string
          reference_number?: string | null
          status?: string
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          amount?: number
          bank_name?: string | null
          branch_id?: string
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          payment_number?: string
          reference_number?: string | null
          status?: string
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      print_templates: {
        Row: {
          body_settings: Json | null
          branch_id: string | null
          created_at: string
          footer_content: Json | null
          header_content: Json | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          page_settings: Json | null
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          body_settings?: Json | null
          branch_id?: string | null
          created_at?: string
          footer_content?: Json | null
          header_content?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          page_settings?: Json | null
          template_name: string
          template_type: string
          updated_at?: string
        }
        Update: {
          body_settings?: Json | null
          branch_id?: string | null
          created_at?: string
          footer_content?: Json | null
          header_content?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          page_settings?: Json | null
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_templates_branch_id_fkey"
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
      quotation_items: {
        Row: {
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          display_order: number | null
          gross_weight: number | null
          hsn_code: string | null
          id: string
          item_code: string | null
          item_name: string
          making_charges: number | null
          metal_type: Database["public"]["Enums"]["metal_type"] | null
          metal_value: number | null
          net_weight: number | null
          product_id: string | null
          purity: string | null
          quantity: number
          quotation_id: string
          rate_per_gram: number | null
          stone_value: number | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          display_order?: number | null
          gross_weight?: number | null
          hsn_code?: string | null
          id?: string
          item_code?: string | null
          item_name: string
          making_charges?: number | null
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          metal_value?: number | null
          net_weight?: number | null
          product_id?: string | null
          purity?: string | null
          quantity?: number
          quotation_id: string
          rate_per_gram?: number | null
          stone_value?: number | null
          total_amount?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          display_order?: number | null
          gross_weight?: number | null
          hsn_code?: string | null
          id?: string
          item_code?: string | null
          item_name?: string
          making_charges?: number | null
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          metal_value?: number | null
          net_weight?: number | null
          product_id?: string | null
          purity?: string | null
          quantity?: number
          quotation_id?: string
          rate_per_gram?: number | null
          stone_value?: number | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          branch_id: string
          converted_invoice_id: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          grand_total: number
          gross_amount: number
          id: string
          notes: string | null
          quotation_date: string
          quotation_number: string
          status: string
          taxable_amount: number
          terms_conditions: string | null
          total_gst: number | null
          updated_at: string
          updated_by: string | null
          valid_until: string | null
        }
        Insert: {
          branch_id: string
          converted_invoice_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          grand_total?: number
          gross_amount?: number
          id?: string
          notes?: string | null
          quotation_date?: string
          quotation_number: string
          status?: string
          taxable_amount?: number
          terms_conditions?: string | null
          total_gst?: number | null
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
        }
        Update: {
          branch_id?: string
          converted_invoice_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          grand_total?: number
          gross_amount?: number
          id?: string
          notes?: string | null
          quotation_date?: string
          quotation_number?: string
          status?: string
          taxable_amount?: number
          terms_conditions?: string | null
          total_gst?: number | null
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_converted_invoice_id_fkey"
            columns: ["converted_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      repair_orders: {
        Row: {
          advance_paid: number | null
          assigned_to: string | null
          balance_due: number | null
          branch_id: string
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_date: string | null
          estimated_cost: number | null
          expected_date: string | null
          final_cost: number | null
          id: string
          issue_description: string | null
          item_description: string
          item_type: string | null
          metal_type: Database["public"]["Enums"]["metal_type"] | null
          notes: string | null
          order_number: string
          purity: string | null
          received_date: string
          status: Database["public"]["Enums"]["order_status"] | null
          updated_at: string | null
          updated_by: string | null
          weight_received: number | null
          weight_returned: number | null
        }
        Insert: {
          advance_paid?: number | null
          assigned_to?: string | null
          balance_due?: number | null
          branch_id: string
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_date?: string | null
          estimated_cost?: number | null
          expected_date?: string | null
          final_cost?: number | null
          id?: string
          issue_description?: string | null
          item_description: string
          item_type?: string | null
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          notes?: string | null
          order_number: string
          purity?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          updated_by?: string | null
          weight_received?: number | null
          weight_returned?: number | null
        }
        Update: {
          advance_paid?: number | null
          assigned_to?: string | null
          balance_due?: number | null
          branch_id?: string
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_date?: string | null
          estimated_cost?: number | null
          expected_date?: string | null
          final_cost?: number | null
          id?: string
          issue_description?: string | null
          item_description?: string
          item_type?: string | null
          metal_type?: Database["public"]["Enums"]["metal_type"] | null
          notes?: string | null
          order_number?: string
          purity?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          updated_by?: string | null
          weight_received?: number | null
          weight_returned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_enrollments: {
        Row: {
          bonus_amount: number | null
          bonus_earned: boolean | null
          branch_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          enrollment_date: string
          enrollment_number: string
          gold_weight_earned: number | null
          id: string
          installments_paid: number
          installments_remaining: number
          locked_gold_rate: number | null
          matured_at: string | null
          maturity_date: string
          monthly_amount: number
          notes: string | null
          payout_amount: number | null
          payout_date: string | null
          payout_mode: string | null
          payout_reference: string | null
          scheme_id: string
          start_date: string
          status: Database["public"]["Enums"]["enrollment_status"]
          total_due: number
          total_paid: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bonus_amount?: number | null
          bonus_earned?: boolean | null
          branch_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          enrollment_date?: string
          enrollment_number: string
          gold_weight_earned?: number | null
          id?: string
          installments_paid?: number
          installments_remaining: number
          locked_gold_rate?: number | null
          matured_at?: string | null
          maturity_date: string
          monthly_amount: number
          notes?: string | null
          payout_amount?: number | null
          payout_date?: string | null
          payout_mode?: string | null
          payout_reference?: string | null
          scheme_id: string
          start_date: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          total_due?: number
          total_paid?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bonus_amount?: number | null
          bonus_earned?: boolean | null
          branch_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          enrollment_date?: string
          enrollment_number?: string
          gold_weight_earned?: number | null
          id?: string
          installments_paid?: number
          installments_remaining?: number
          locked_gold_rate?: number | null
          matured_at?: string | null
          maturity_date?: string
          monthly_amount?: number
          notes?: string | null
          payout_amount?: number | null
          payout_date?: string | null
          payout_mode?: string | null
          payout_reference?: string | null
          scheme_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          total_due?: number
          total_paid?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_enrollments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_enrollments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_enrollments_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_payments: {
        Row: {
          amount_due: number
          amount_paid: number | null
          bank_name: string | null
          branch_id: string
          cheque_date: string | null
          cheque_number: string | null
          created_at: string
          created_by: string | null
          due_date: string
          enrollment_id: string
          id: string
          installment_number: number
          notes: string | null
          payment_date: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"] | null
          payment_number: string
          penalty_amount: number | null
          receipt_printed: boolean | null
          reference_number: string | null
          status: Database["public"]["Enums"]["scheme_payment_status"]
          upi_id: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          bank_name?: string | null
          branch_id: string
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          created_by?: string | null
          due_date: string
          enrollment_id: string
          id?: string
          installment_number: number
          notes?: string | null
          payment_date?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          payment_number: string
          penalty_amount?: number | null
          receipt_printed?: boolean | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["scheme_payment_status"]
          upi_id?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          bank_name?: string | null
          branch_id?: string
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          enrollment_id?: string
          id?: string
          installment_number?: number
          notes?: string | null
          payment_date?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          payment_number?: string
          penalty_amount?: number | null
          receipt_printed?: boolean | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["scheme_payment_status"]
          upi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_payments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "scheme_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          bonus_month: number | null
          bonus_type: string
          bonus_value: number
          branch_id: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_months: number
          end_date: string | null
          gold_rate_lock_type: string | null
          grace_period_days: number | null
          id: string
          is_gold_scheme: boolean | null
          late_payment_penalty_percent: number | null
          max_enrollments: number | null
          min_enrollments: number | null
          monthly_amount: number
          scheme_code: string
          scheme_name: string
          start_date: string | null
          status: Database["public"]["Enums"]["scheme_status"]
          terms_conditions: string | null
          total_amount: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bonus_month?: number | null
          bonus_type?: string
          bonus_value?: number
          branch_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_months?: number
          end_date?: string | null
          gold_rate_lock_type?: string | null
          grace_period_days?: number | null
          id?: string
          is_gold_scheme?: boolean | null
          late_payment_penalty_percent?: number | null
          max_enrollments?: number | null
          min_enrollments?: number | null
          monthly_amount: number
          scheme_code: string
          scheme_name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["scheme_status"]
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bonus_month?: number | null
          bonus_type?: string
          bonus_value?: number
          branch_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_months?: number
          end_date?: string | null
          gold_rate_lock_type?: string | null
          grace_period_days?: number | null
          id?: string
          is_gold_scheme?: boolean | null
          late_payment_penalty_percent?: number | null
          max_enrollments?: number | null
          min_enrollments?: number | null
          monthly_amount?: number
          scheme_code?: string
          scheme_name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["scheme_status"]
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schemes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
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
      account_type: "asset" | "liability" | "equity" | "income" | "expense"
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
      enrollment_status:
        | "active"
        | "completed"
        | "cancelled"
        | "defaulted"
        | "matured"
      gold_purity: "24K" | "22K" | "18K" | "14K" | "10K"
      invoice_status:
        | "draft"
        | "confirmed"
        | "paid"
        | "partially_paid"
        | "cancelled"
        | "returned"
      loan_payment_type:
        | "interest"
        | "principal"
        | "part_release"
        | "full_redemption"
        | "renewal_fee"
      loan_status:
        | "pending"
        | "active"
        | "closed"
        | "defaulted"
        | "auctioned"
        | "renewed"
      making_charge_type: "per_gram" | "percentage" | "flat"
      metal_color: "yellow" | "white" | "rose" | "two_tone" | "tri_tone"
      metal_type: "gold" | "silver" | "platinum" | "palladium"
      order_status:
        | "pending"
        | "in_progress"
        | "ready"
        | "delivered"
        | "cancelled"
      payment_mode:
        | "cash"
        | "card"
        | "upi"
        | "bank_transfer"
        | "cheque"
        | "credit"
        | "old_gold"
      product_status:
        | "in_stock"
        | "sold"
        | "on_approval"
        | "with_karigar"
        | "in_repair"
        | "melted"
      scheme_payment_status: "pending" | "paid" | "overdue" | "waived"
      scheme_status: "active" | "inactive" | "discontinued"
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
      account_type: ["asset", "liability", "equity", "income", "expense"],
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
      enrollment_status: [
        "active",
        "completed",
        "cancelled",
        "defaulted",
        "matured",
      ],
      gold_purity: ["24K", "22K", "18K", "14K", "10K"],
      invoice_status: [
        "draft",
        "confirmed",
        "paid",
        "partially_paid",
        "cancelled",
        "returned",
      ],
      loan_payment_type: [
        "interest",
        "principal",
        "part_release",
        "full_redemption",
        "renewal_fee",
      ],
      loan_status: [
        "pending",
        "active",
        "closed",
        "defaulted",
        "auctioned",
        "renewed",
      ],
      making_charge_type: ["per_gram", "percentage", "flat"],
      metal_color: ["yellow", "white", "rose", "two_tone", "tri_tone"],
      metal_type: ["gold", "silver", "platinum", "palladium"],
      order_status: [
        "pending",
        "in_progress",
        "ready",
        "delivered",
        "cancelled",
      ],
      payment_mode: [
        "cash",
        "card",
        "upi",
        "bank_transfer",
        "cheque",
        "credit",
        "old_gold",
      ],
      product_status: [
        "in_stock",
        "sold",
        "on_approval",
        "with_karigar",
        "in_repair",
        "melted",
      ],
      scheme_payment_status: ["pending", "paid", "overdue", "waived"],
      scheme_status: ["active", "inactive", "discontinued"],
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
