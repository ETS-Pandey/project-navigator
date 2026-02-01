// JewelPro Loans Module Types

export type LoanStatus = 'pending' | 'active' | 'closed' | 'defaulted' | 'auctioned' | 'renewed';

export interface LoanRenewalFormData {
  new_interest_rate: number;
  new_tenure_months: number;
  interest_type: 'simple' | 'compound';
  renewal_fee: number;
  notes?: string;
}
export type LoanPaymentType = 'interest' | 'principal' | 'part_release' | 'full_redemption' | 'renewal_fee';
export type PaymentMode = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';

export interface Loan {
  id: string;
  branch_id: string;
  customer_id: string;
  loan_number: string;
  loan_date: string;
  
  // Loan amounts
  collateral_value: number;
  loan_amount: number;
  ltv_percent: number;
  
  // Interest terms
  interest_rate: number;
  interest_type: string;
  tenure_months: number;
  due_date: string;
  
  // Running totals
  principal_paid: number;
  interest_paid: number;
  interest_accrued: number;
  outstanding_principal: number;
  outstanding_interest: number;
  outstanding_total: number;
  
  // Status
  status: LoanStatus;
  closed_date?: string;
  closed_by?: string;
  
  // Renewal tracking
  renewed_from_loan_id?: string;
  renewed_to_loan_id?: string;
  
  // Metadata
  notes?: string;
  terms_conditions?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    customer_code: string;
  };
  collaterals?: LoanCollateral[];
}

export interface LoanCollateral {
  id: string;
  loan_id: string;
  
  // Item details
  item_description: string;
  metal_type: 'gold' | 'silver' | 'platinum';
  purity: string;
  gross_weight: number;
  net_weight: number;
  stone_weight: number;
  
  // Valuation
  rate_per_gram: number;
  item_value: number;
  
  // Storage
  storage_location?: string;
  packet_number?: string;
  
  // Images
  image_url?: string;
  
  // Status
  is_released: boolean;
  released_at?: string;
  released_by?: string;
  
  created_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  branch_id: string;
  
  payment_number: string;
  payment_date: string;
  payment_type: LoanPaymentType;
  
  // Amount breakdown
  amount: number;
  principal_amount: number;
  interest_amount: number;
  penalty_amount: number;
  
  // Payment mode
  payment_mode: PaymentMode;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  upi_id?: string;
  
  // For part release
  collateral_ids?: string[];
  
  notes?: string;
  receipt_printed: boolean;
  
  created_by?: string;
  created_at: string;
}

export interface LoanInterestAccrual {
  id: string;
  loan_id: string;
  
  accrual_date: string;
  days_count: number;
  principal_balance: number;
  interest_rate: number;
  interest_amount: number;
  cumulative_interest: number;
  
  is_paid: boolean;
  paid_in_payment_id?: string;
  
  created_at: string;
}

// Form data types
export interface LoanFormData {
  customer_id: string;
  loan_date: string;
  interest_rate: number;
  interest_type: 'simple' | 'compound';
  tenure_months: number;
  notes?: string;
  collaterals: CollateralFormData[];
}

export interface CollateralFormData {
  item_description: string;
  metal_type: 'gold' | 'silver' | 'platinum';
  purity: string;
  gross_weight: number;
  stone_weight: number;
  rate_per_gram: number;
  storage_location?: string;
  packet_number?: string;
}

export interface LoanPaymentFormData {
  payment_type: LoanPaymentType;
  amount: number;
  principal_amount: number;
  interest_amount: number;
  penalty_amount?: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  upi_id?: string;
  collateral_ids?: string[];
  notes?: string;
}

// Filters
export interface LoanFilters {
  status?: LoanStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  overdueOnly?: boolean;
}

// Statistics
export interface LoanStatistics {
  totalActiveLoans: number;
  totalOutstanding: number;
  totalCollateralValue: number;
  overdueCount: number;
  overdueAmount: number;
  dueTodayCount: number;
  dueTodayAmount: number;
}
