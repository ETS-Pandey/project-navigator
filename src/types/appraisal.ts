// Appraisal Types

export interface AppraisalItem {
  id: string;
  appraisal_id: string;
  item_number: number;
  description: string;
  metal_type: string;
  purity: string;
  gross_weight: number;
  stone_weight: number | null;
  net_weight: number;
  wastage_percent: number | null;
  rate_per_gram: number;
  metal_value: number;
  stone_type: string | null;
  stone_count: number | null;
  stone_carat: number | null;
  stone_value: number | null;
  making_charge_value: number | null;
  total_value: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  hallmark_status: string | null;
  huid: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Appraisal {
  id: string;
  branch_id: string;
  appraisal_number: string;
  appraisal_date: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  purpose: 'valuation' | 'insurance' | 'loan' | 'sale' | 'purchase';
  items: any[];
  total_items: number;
  total_weight: number;
  total_metal_value: number;
  total_stone_value: number;
  total_making_value: number;
  grand_total: number;
  market_rate_gold: number | null;
  market_rate_silver: number | null;
  appraised_by: string | null;
  verified_by: string | null;
  certificate_issued: boolean;
  certificate_number: string | null;
  validity_days: number | null;
  valid_until: string | null;
  status: 'draft' | 'in_progress' | 'completed' | 'certificate_issued' | 'expired';
  notes: string | null;
  terms_conditions: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  appraisal_items?: AppraisalItem[];
  customer?: any;
}
