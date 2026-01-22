import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductFormData, StockMovement, ProductStatus, StockMovementType } from "@/types/inventory";

interface ProductFilters {
  categoryId?: string;
  status?: ProductStatus;
  search?: string;
}

export function useProducts(filters?: ProductFilters) {
  const { currentBranch } = useBranch();

  return useQuery({
    queryKey: ["products", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];

      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          sub_category:sub_categories(*)
        `)
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });

      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,item_code.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          sub_category:sub_categories(*),
          images:product_images(*),
          stones:product_stones(*)
        `)
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ProductFormData & { net_weight: number; wastage_weight: number; metal_value: number; making_charge_amount: number; total_cost: number; stone_count: number }) => {
      if (!currentBranch?.id || !user?.id) {
        throw new Error("No branch or user selected");
      }

      // Generate item code
      const timestamp = Date.now().toString(36).toUpperCase();
      const itemCode = `${data.purity}-${timestamp}`;

      const { data: result, error } = await supabase
        .from("products")
        .insert([{
          branch_id: currentBranch.id,
          category_id: data.category_id,
          sub_category_id: data.sub_category_id || null,
          name: data.name,
          description: data.description || null,
          metal_type: data.metal_type,
          purity: data.purity,
          metal_color: data.metal_color,
          gross_weight: data.gross_weight,
          stone_weight: data.stone_weight,
          net_weight: data.net_weight,
          wastage_percent: data.wastage_percent,
          wastage_weight: data.wastage_weight,
          making_charge_type: data.making_charge_type,
          making_charge_value: data.making_charge_value,
          making_charge_amount: data.making_charge_amount,
          has_stones: data.has_stones,
          stone_value: data.stone_value,
          stone_count: data.stone_count,
          huid: data.huid || null,
          hallmark_center: data.hallmark_center || null,
          is_hallmarked: data.is_hallmarked,
          metal_value: data.metal_value,
          total_cost: data.total_cost,
          mrp: data.mrp || null,
          wholesale_price: data.wholesale_price || null,
          location: data.location || null,
          item_code: itemCode,
          barcode: itemCode,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Create stock movement for new product
      await supabase.from("stock_movements").insert([{
        product_id: result.id,
        branch_id: currentBranch.id,
        movement_type: "purchase" as StockMovementType,
        quantity: 1,
        reference_type: "initial_stock",
        notes: "Initial stock entry",
        created_by: user.id,
      }]);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating product", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Product> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("products")
        .update({
          ...data,
          updated_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      toast({ title: "Product updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating product", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
    },
  });
}

export function useStockMovements(productId?: string) {
  const { currentBranch } = useBranch();

  return useQuery({
    queryKey: ["stock_movements", currentBranch?.id, productId],
    queryFn: async () => {
      if (!currentBranch?.id) return [];

      let query = supabase
        .from("stock_movements")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StockMovement[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { product_id: string; movement_type: StockMovementType; quantity?: number; notes?: string; to_location?: string }) => {
      if (!currentBranch?.id || !user?.id) {
        throw new Error("No branch or user selected");
      }

      const { data: result, error } = await supabase
        .from("stock_movements")
        .insert([{
          product_id: data.product_id,
          branch_id: currentBranch.id,
          movement_type: data.movement_type,
          quantity: data.quantity || 1,
          notes: data.notes || null,
          to_location: data.to_location || null,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Stock movement recorded" });
    },
    onError: (error: Error) => {
      toast({ title: "Error recording stock movement", description: error.message, variant: "destructive" });
    },
  });
}
