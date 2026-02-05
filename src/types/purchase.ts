export interface Vendor {
  id: string;
  branch_id: string;
  vendor_code: string;
  name: string;
  company_name: string | null;
  vendor_type: 'supplier' | 'wholesaler' | 'bullion_dealer' | 'stone_dealer' | 'karigar';
  
  phone: string | null;
  alt_phone: string | null;
  email: string | null;
  website: string | null;
  
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  
  gstin: string | null;
  pan: string | null;
  
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_branch: string | null;
  
  credit_period_days: number;
  credit_limit: number;
  current_balance: number;
  
  is_active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  branch_id: string;
  purchase_number: string;
  vendor_id: string | null;
  
  purchase_type: 'bullion' | 'finished' | 'stones' | 'consumables' | 'other';
  purchase_date: string;
  invoice_number: string | null;
  invoice_date: string | null;
  
  gross_amount: number;
  discount_percent: number | null;
  discount_amount: number;
  taxable_amount: number;
  cgst_percent: number | null;
  cgst_amount: number;
  sgst_percent: number | null;
  sgst_amount: number;
  igst_percent: number | null;
  igst_amount: number;
  total_gst: number;
  other_charges: number;
  round_off: number;
  grand_total: number;
  
  amount_paid: number;
  balance_due: number;
  payment_due_date: string | null;
  
  total_gross_weight: number | null;
  total_net_weight: number | null;
  
  status: 'draft' | 'confirmed' | 'partially_paid' | 'paid' | 'cancelled';
  is_interstate: boolean;
  notes: string | null;
  
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  
  vendor?: Vendor;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string | null;
  
  item_description: string;
  hsn_code: string | null;
  
  metal_type: string | null;
  purity: string | null;
  gross_weight: number | null;
  stone_weight: number | null;
  net_weight: number | null;
  rate_per_gram: number | null;
  
  quantity: number;
  unit: string;
  unit_price: number;
  
  making_charges: number;
  stone_value: number;
  other_charges: number;
  
  discount_percent: number | null;
  discount_amount: number;
  
  taxable_amount: number;
  gst_percent: number | null;
  gst_amount: number;
  total_amount: number;
  
  display_order: number;
  created_at: string;
}

export interface VendorPayment {
  id: string;
  branch_id: string;
  payment_number: string;
  vendor_id: string;
  purchase_id: string | null;
  
  payment_date: string;
  amount: number;
  
  payment_mode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
  reference_number: string | null;
  bank_name: string | null;
  cheque_number: string | null;
  cheque_date: string | null;
  
  deduction_amount: number;
  deduction_reason: string | null;
  tds_amount: number;
  
  notes: string | null;
  created_by: string | null;
  created_at: string;
  
  vendor?: Vendor;
  purchase?: Purchase;
}

export interface VendorFormData {
  name: string;
  company_name?: string;
  vendor_type: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  credit_period_days?: number;
  credit_limit?: number;
  notes?: string;
}

export interface PurchaseFormData {
  vendor_id?: string;
  purchase_type: string;
  purchase_date: string;
  invoice_number?: string;
  invoice_date?: string;
  is_interstate?: boolean;
  notes?: string;
}

export interface VendorPaymentFormData {
  vendor_id: string;
  purchase_id?: string;
  amount: number;
  payment_mode: string;
  payment_date: string;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  deduction_amount?: number;
  deduction_reason?: string;
  tds_amount?: number;
  notes?: string;
}
