import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CatalogFilters {
  categoryId?: string;
  metalType?: string;
  search?: string;
  minWeight?: number;
  maxWeight?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "weight";
}

export function useCatalogProducts(filters?: CatalogFilters) {
  return useQuery({
    queryKey: ["catalog-products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          id, name, item_code, description, metal_type, purity, metal_color,
          gross_weight, net_weight, stone_weight, wastage_percent,
          making_charge_type, making_charge_value,
          has_stones, stone_value, stone_count,
          is_hallmarked, huid,
          metal_value, total_cost, mrp,
          status, is_published, is_featured,
          category_id, created_at,
          category:categories(id, name, code, image_url),
          images:product_images(id, image_url, is_primary, display_order)
        `)
        .eq("status", "in_stock")
        .eq("is_published", true)
        .order("is_featured", { ascending: false });

      if (filters?.categoryId && filters.categoryId !== "all") {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters?.metalType && filters.metalType !== "all") {
        query = query.eq("metal_type", filters.metalType as "gold" | "silver" | "platinum" | "palladium");
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,item_code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }
      if (filters?.minWeight) {
        query = query.gte("gross_weight", filters.minWeight);
      }
      if (filters?.maxWeight) {
        query = query.lte("gross_weight", filters.maxWeight);
      }

      if (filters?.sortBy === "price_asc") {
        query = query.order("total_cost", { ascending: true });
      } else if (filters?.sortBy === "price_desc") {
        query = query.order("total_cost", { ascending: false });
      } else if (filters?.sortBy === "weight") {
        query = query.order("gross_weight", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCatalogCategories() {
  return useQuery({
    queryKey: ["catalog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, code, image_url, description")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useSubmitInquiry() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inquiry: {
      branchId: string;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      message?: string;
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        estimatedPrice: number;
      }>;
    }) => {
      const inquiryNumber = `INQ-${Date.now().toString(36).toUpperCase()}`;
      const totalValue = inquiry.items.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);

      const { data, error } = await supabase
        .from("catalog_inquiries")
        .insert({
          branch_id: inquiry.branchId,
          customer_name: inquiry.customerName,
          customer_phone: inquiry.customerPhone || null,
          customer_email: inquiry.customerEmail || null,
          message: inquiry.message || null,
          items: inquiry.items as any,
          total_estimated_value: totalValue,
          inquiry_number: inquiryNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Inquiry submitted!", description: "We'll get back to you soon." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to submit inquiry", description: error.message, variant: "destructive" });
    },
  });
}

export function useCatalogInquiries() {
  return useQuery({
    queryKey: ["catalog-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
