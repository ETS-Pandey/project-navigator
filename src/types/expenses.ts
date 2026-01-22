export interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  branch_id: string;
  expense_number: string;
  category_id: string | null;
  
  amount: number;
  payment_mode: string;
  expense_date: string;
  
  vendor_name: string | null;
  description: string | null;
  reference_number: string | null;
  
  is_gst_applicable: boolean;
  gst_amount: number | null;
  
  status: string;
  approved_by: string | null;
  
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  
  category?: ExpenseCategory;
}

export interface ExpenseFormData {
  category_id?: string;
  amount: number;
  payment_mode: string;
  expense_date: string;
  vendor_name?: string;
  description?: string;
  reference_number?: string;
  is_gst_applicable?: boolean;
  gst_amount?: number;
}
