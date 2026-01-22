// Savings Schemes Module Types

export type SchemeStatus = 'active' | 'inactive' | 'discontinued';
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled' | 'defaulted' | 'matured';
export type SchemePaymentStatus = 'pending' | 'paid' | 'overdue' | 'waived';
export type PaymentMode = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';

export interface Scheme {
  id: string;
  branch_id: string;
  scheme_code: string;
  scheme_name: string;
  description?: string;
  
  // Terms
  duration_months: number;
  monthly_amount: number;
  total_amount: number;
  
  // Benefits
  bonus_type: 'fixed' | 'percentage' | 'gold_bonus';
  bonus_value: number;
  bonus_month?: number;
  
  // Gold scheme specific
  is_gold_scheme: boolean;
  gold_rate_lock_type?: 'enrollment' | 'average' | 'maturity';
  
  // Penalty
  late_payment_penalty_percent: number;
  grace_period_days: number;
  
  // Limits
  min_enrollments: number;
  max_enrollments?: number;
  
  // Status
  status: SchemeStatus;
  start_date?: string;
  end_date?: string;
  
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  enrollments_count?: number;
}

export interface SchemeEnrollment {
  id: string;
  branch_id: string;
  scheme_id: string;
  customer_id: string;
  
  enrollment_number: string;
  enrollment_date: string;
  start_date: string;
  maturity_date: string;
  
  monthly_amount: number;
  total_paid: number;
  total_due: number;
  installments_paid: number;
  installments_remaining: number;
  
  bonus_amount: number;
  bonus_earned: boolean;
  
  locked_gold_rate?: number;
  gold_weight_earned: number;
  
  status: EnrollmentStatus;
  matured_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  
  payout_amount: number;
  payout_date?: string;
  payout_mode?: string;
  payout_reference?: string;
  
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  customer?: {
    id: string;
    name: string;
    phone?: string;
    customer_code: string;
  };
  scheme?: Scheme;
  payments?: SchemePayment[];
}

export interface SchemePayment {
  id: string;
  branch_id: string;
  enrollment_id: string;
  
  payment_number: string;
  installment_number: number;
  due_date: string;
  payment_date?: string;
  
  amount_due: number;
  amount_paid: number;
  penalty_amount: number;
  
  payment_mode?: PaymentMode;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  upi_id?: string;
  
  status: SchemePaymentStatus;
  notes?: string;
  receipt_printed: boolean;
  created_at: string;
}

// Form types
export interface SchemeFormData {
  scheme_code: string;
  scheme_name: string;
  description?: string;
  duration_months: number;
  monthly_amount: number;
  bonus_type: 'fixed' | 'percentage' | 'gold_bonus';
  bonus_value: number;
  bonus_month?: number;
  is_gold_scheme: boolean;
  gold_rate_lock_type?: 'enrollment' | 'average' | 'maturity';
  late_payment_penalty_percent: number;
  grace_period_days: number;
  terms_conditions?: string;
}

export interface EnrollmentFormData {
  scheme_id: string;
  customer_id: string;
  start_date: string;
  notes?: string;
}

export interface SchemePaymentFormData {
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  upi_id?: string;
  notes?: string;
}

// Statistics
export interface SchemeStatistics {
  totalActiveEnrollments: number;
  totalCollected: number;
  pendingDues: number;
  maturing_this_month: number;
  overdue_payments: number;
}
