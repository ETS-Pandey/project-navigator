export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export interface ChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  parent_id: string | null;
  
  description: string | null;
  opening_balance: number;
  current_balance: number;
  
  is_system_account: boolean;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  branch_id: string;
  entry_number: string;
  entry_date: string;
  
  narration: string | null;
  reference_type: string | null;
  reference_id: string | null;
  
  total_debit: number;
  total_credit: number;
  
  is_posted: boolean;
  
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  
  debit_amount: number;
  credit_amount: number;
  
  narration: string | null;
  created_at: string;
  
  account?: ChartOfAccount;
}

export interface JournalEntryFormData {
  entry_date: string;
  narration?: string;
  lines: {
    account_id: string;
    debit_amount?: number;
    credit_amount?: number;
    narration?: string;
  }[];
}
