// Karigar (Artisan) Types

export interface Karigar {
  id: string;
  branch_id: string;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  aadhar: string | null;
  pan: string | null;
  specialization: string | null;
  commission_rate: number;
  balance_gold_grams: number;
  balance_silver_grams: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface KarigarFormData {
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  aadhar?: string;
  pan?: string;
  specialization?: string;
  commission_rate?: number;
  notes?: string;
  is_active?: boolean;
}
