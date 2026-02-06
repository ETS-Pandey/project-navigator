// Melting & Refining Types

export interface MeltingInputItem {
  description: string;
  weight: number;
  purity: string;
  source: string;
}

export interface MeltingOutputAllocation {
  description: string;
  weight: number;
  purpose: string;
}

export interface MeltingBatch {
  id: string;
  branch_id: string;
  batch_number: string;
  batch_date: string;
  metal_type: string;
  input_total_weight: number;
  input_items: MeltingInputItem[];
  expected_pure_weight: number | null;
  actual_output_weight: number | null;
  output_purity: string | null;
  actual_pure_weight: number | null;
  weight_loss: number | null;
  loss_percentage: number | null;
  refiner_name: string | null;
  refining_charges: number | null;
  assay_certificate: string | null;
  output_allocation: MeltingOutputAllocation[];
  status: 'pending' | 'in_process' | 'completed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RefiningRecord {
  id: string;
  branch_id: string;
  melting_batch_id: string | null;
  record_number: string;
  test_date: string;
  metal_type: string;
  sample_weight: number;
  tested_purity: string;
  pure_metal_content: number | null;
  testing_method: string | null;
  tested_by: string | null;
  lab_name: string | null;
  lab_certificate: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}
