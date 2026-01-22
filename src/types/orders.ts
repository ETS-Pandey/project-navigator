export type OrderStatus = "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

export interface RepairOrder {
  id: string;
  branch_id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  
  item_description: string;
  item_type: string | null;
  metal_type: string | null;
  purity: string | null;
  weight_received: number | null;
  weight_returned: number | null;
  
  issue_description: string | null;
  estimated_cost: number | null;
  final_cost: number | null;
  advance_paid: number;
  balance_due: number;
  
  status: OrderStatus;
  received_date: string;
  expected_date: string | null;
  completed_date: string | null;
  delivered_date: string | null;
  
  assigned_to: string | null;
  notes: string | null;
  
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  
  customer?: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface CustomOrder {
  id: string;
  branch_id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  
  design_description: string;
  design_reference_url: string | null;
  metal_type: string | null;
  purity: string | null;
  estimated_weight: number | null;
  actual_weight: number | null;
  
  estimated_cost: number | null;
  final_cost: number | null;
  advance_paid: number;
  balance_due: number;
  
  status: OrderStatus;
  order_date: string;
  expected_date: string | null;
  completed_date: string | null;
  delivered_date: string | null;
  
  assigned_karigar: string | null;
  notes: string | null;
  
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  
  customer?: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface RepairOrderFormData {
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  item_description: string;
  item_type?: string;
  metal_type?: string;
  purity?: string;
  weight_received?: number;
  issue_description?: string;
  estimated_cost?: number;
  advance_paid?: number;
  expected_date?: string;
  assigned_to?: string;
  notes?: string;
}

export interface CustomOrderFormData {
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  design_description: string;
  design_reference_url?: string;
  metal_type?: string;
  purity?: string;
  estimated_weight?: number;
  estimated_cost?: number;
  advance_paid?: number;
  expected_date?: string;
  assigned_karigar?: string;
  notes?: string;
}
