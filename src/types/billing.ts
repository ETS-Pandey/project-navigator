// Billing Module Types

export type CustomerType = 'retail' | 'wholesale' | 'corporate';
export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'partially_paid' | 'cancelled' | 'returned';
export type PaymentMode = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque' | 'credit' | 'old_gold';
export type OldGoldStatus = 'pending' | 'approved' | 'adjusted' | 'rejected';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type TestingMethod = 'touchstone' | 'electronic' | 'fire_assay' | 'xrf';

export interface Customer {
  id: string;
  branch_id: string;
  customer_code: string;
  customer_type: CustomerType;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  aadhar?: string;
  date_of_birth?: string;
  anniversary?: string;
  loyalty_points: number;
  credit_limit: number;
  outstanding_balance: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  branch_id: string;
  customer_id?: string;
  invoice_number: string;
  invoice_date: string;
  invoice_type: 'sale' | 'purchase' | 'sale_return' | 'purchase_return';
  status: InvoiceStatus;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_gstin?: string;
  gross_amount: number;
  discount_percent: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst: number;
  round_off: number;
  grand_total: number;
  old_gold_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_due_date?: string;
  notes?: string;
  terms_conditions?: string;
  is_interstate: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  customer?: Customer;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  item_code?: string;
  item_name: string;
  hsn_code: string;
  description?: string;
  metal_type?: string;
  purity?: string;
  gross_weight?: number;
  net_weight?: number;
  rate_per_gram?: number;
  metal_value: number;
  making_charge_type?: string;
  making_charge_value: number;
  making_charges: number;
  stone_value: number;
  other_charges: number;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_percent: number;
  cgst_amount: number;
  sgst_percent: number;
  sgst_amount: number;
  igst_percent: number;
  igst_amount: number;
  total_amount: number;
  display_order: number;
}

export interface OldGoldPurchase {
  id: string;
  branch_id: string;
  invoice_id?: string;
  customer_id?: string;
  purchase_number: string;
  purchase_date: string;
  metal_type: string;
  purity: string;
  gross_weight: number;
  deduction_percent: number;
  deduction_weight: number;
  net_weight: number;
  rate_per_gram: number;
  gross_value: number;
  deduction_amount: number;
  net_value: number;
  testing_method?: TestingMethod;
  tested_by?: string;
  status: OldGoldStatus;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  customer?: Customer;
}

export interface Quotation {
  id: string;
  branch_id: string;
  customer_id?: string;
  quotation_number: string;
  quotation_date: string;
  valid_until?: string;
  status: QuotationStatus;
  converted_invoice_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  gross_amount: number;
  discount_amount: number;
  taxable_amount: number;
  total_gst: number;
  grand_total: number;
  notes?: string;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  customer?: Customer;
  items?: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id?: string;
  item_code?: string;
  item_name: string;
  hsn_code: string;
  description?: string;
  metal_type?: string;
  purity?: string;
  gross_weight?: number;
  net_weight?: number;
  rate_per_gram?: number;
  metal_value: number;
  making_charges: number;
  stone_value: number;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  total_amount: number;
  display_order: number;
}

export interface Payment {
  id: string;
  branch_id: string;
  invoice_id?: string;
  customer_id?: string;
  payment_number: string;
  payment_date: string;
  payment_mode: PaymentMode;
  amount: number;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  upi_id?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  // Joined data
  customer?: Customer;
  invoice?: Invoice;
}

// Form types
export interface CustomerFormData {
  customer_type: CustomerType;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  aadhar?: string;
  date_of_birth?: string;
  anniversary?: string;
  credit_limit?: number;
  notes?: string;
}

export interface InvoiceItemFormData {
  product_id?: string;
  item_code?: string;
  item_name: string;
  hsn_code: string;
  description?: string;
  metal_type?: string;
  purity?: string;
  gross_weight?: number;
  net_weight?: number;
  rate_per_gram?: number;
  metal_value: number;
  making_charge_type?: string;
  making_charge_value: number;
  making_charges: number;
  stone_value: number;
  other_charges: number;
  quantity: number;
  unit_price: number;
  discount_percent: number;
}

export interface OldGoldFormData {
  customer_id?: string;
  metal_type: string;
  purity: string;
  gross_weight: number;
  deduction_percent: number;
  rate_per_gram: number;
  testing_method?: TestingMethod;
  notes?: string;
}

export interface PaymentFormData {
  invoice_id?: string;
  customer_id?: string;
  payment_mode: PaymentMode;
  amount: number;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  upi_id?: string;
  notes?: string;
}
