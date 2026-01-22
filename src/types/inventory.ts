// Inventory Types

export type MetalColor = 'yellow' | 'white' | 'rose' | 'two_tone' | 'tri_tone';
export type MakingChargeType = 'per_gram' | 'percentage' | 'flat';
export type StockMovementType = 'purchase' | 'sale' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'karigar_issue' | 'karigar_receipt' | 'return';
export type ProductStatus = 'in_stock' | 'sold' | 'on_approval' | 'with_karigar' | 'in_repair' | 'melted';
export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  hsn_code: string;
  default_making_charge_type: MakingChargeType;
  default_making_charge_value: number;
  created_at: string;
  updated_at: string;
}

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  code: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  branch_id: string;
  category_id: string;
  sub_category_id: string | null;
  item_code: string;
  barcode: string | null;
  name: string;
  description: string | null;
  metal_type: MetalType;
  purity: string;
  metal_color: MetalColor;
  gross_weight: number;
  stone_weight: number;
  net_weight: number;
  wastage_percent: number;
  wastage_weight: number;
  total_weight: number;
  making_charge_type: MakingChargeType;
  making_charge_value: number;
  making_charge_amount: number;
  has_stones: boolean;
  stone_count: number;
  stone_value: number;
  huid: string | null;
  hallmark_center: string | null;
  hallmark_date: string | null;
  is_hallmarked: boolean;
  metal_value: number;
  total_cost: number;
  mrp: number | null;
  wholesale_price: number | null;
  status: ProductStatus;
  location: string | null;
  supplier_id: string | null;
  purchase_date: string | null;
  purchase_invoice: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
  sub_category?: SubCategory;
  images?: ProductImage[];
  stones?: ProductStone[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface ProductStone {
  id: string;
  product_id: string;
  stone_type: string;
  stone_shape: string | null;
  stone_count: number;
  carat_weight: number | null;
  color: string | null;
  clarity: string | null;
  cut: string | null;
  certification: string | null;
  certificate_number: string | null;
  stone_value: number;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  branch_id: string;
  movement_type: StockMovementType;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  from_location: string | null;
  to_location: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

// Form types
export interface ProductFormData {
  category_id: string;
  sub_category_id?: string;
  name: string;
  description?: string;
  metal_type: MetalType;
  purity: string;
  metal_color: MetalColor;
  gross_weight: number;
  stone_weight: number;
  net_weight: number;
  wastage_percent: number;
  making_charge_type: MakingChargeType;
  making_charge_value: number;
  has_stones: boolean;
  stone_value: number;
  huid?: string;
  hallmark_center?: string;
  hallmark_date?: string;
  is_hallmarked: boolean;
  mrp?: number;
  wholesale_price?: number;
  location?: string;
}
