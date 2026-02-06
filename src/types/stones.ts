// Stone Inventory Types

export interface StoneType {
  id: string;
  name: string;
  code: string;
  category: 'precious' | 'semi_precious' | 'synthetic';
  default_unit: 'carat' | 'piece' | 'gram';
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoneLot {
  id: string;
  branch_id: string;
  stone_type_id: string;
  lot_number: string;
  supplier_name: string | null;
  purchase_date: string;
  total_pieces: number;
  total_carat_weight: number;
  total_cost: number;
  cost_per_carat: number;
  available_pieces: number;
  available_carat_weight: number;
  shape: string | null;
  color_grade: string | null;
  clarity_grade: string | null;
  cut_grade: string | null;
  certification: string | null;
  certificate_number: string | null;
  notes: string | null;
  status: 'available' | 'partially_used' | 'depleted';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  stone_type?: StoneType;
}

export interface StoneInventoryItem {
  id: string;
  branch_id: string;
  stone_type_id: string;
  lot_id: string | null;
  stone_code: string;
  carat_weight: number;
  shape: string | null;
  color_grade: string | null;
  clarity_grade: string | null;
  cut_grade: string | null;
  dimensions: string | null;
  certification: string | null;
  certificate_number: string | null;
  certificate_url: string | null;
  cost_price: number;
  market_value: number | null;
  status: 'available' | 'issued' | 'set' | 'sold' | 'returned' | 'lost';
  assigned_product_id: string | null;
  assigned_karigar_id: string | null;
  location: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  stone_type?: StoneType;
  lot?: StoneLot;
}

export interface StoneMovement {
  id: string;
  branch_id: string;
  stone_inventory_id: string | null;
  lot_id: string | null;
  movement_type: string;
  quantity: number;
  carat_weight: number | null;
  karigar_id: string | null;
  product_id: string | null;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}
