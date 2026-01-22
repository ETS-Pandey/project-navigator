import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Category, SubCategory } from "@/types/inventory";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useSubCategories(categoryId?: string) {
  return useQuery({
    queryKey: ["sub_categories", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("sub_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SubCategory[];
    },
    enabled: !categoryId || categoryId.length > 0,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string; code: string; hsn_code?: string; default_making_charge_type?: "per_gram" | "percentage" | "flat"; default_making_charge_value?: number }) => {
      const { data: result, error } = await supabase
        .from("categories")
        .insert([{
          name: data.name,
          code: data.code,
          hsn_code: data.hsn_code || "7113",
          default_making_charge_type: data.default_making_charge_type || "per_gram",
          default_making_charge_value: data.default_making_charge_value || 0,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating category", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; hsn_code?: string; default_making_charge_type?: "per_gram" | "percentage" | "flat"; default_making_charge_value?: number }) => {
      const updateData: Record<string, unknown> = {};
      if (data.name) updateData.name = data.name;
      if (data.hsn_code) updateData.hsn_code = data.hsn_code;
      if (data.default_making_charge_type) updateData.default_making_charge_type = data.default_making_charge_type;
      if (data.default_making_charge_value !== undefined) updateData.default_making_charge_value = data.default_making_charge_value;
      
      const { data: result, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating category", description: error.message, variant: "destructive" });
    },
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { category_id: string; name: string; code: string }) => {
      const { data: result, error } = await supabase
        .from("sub_categories")
        .insert([{
          category_id: data.category_id,
          name: data.name,
          code: data.code,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub_categories"] });
      toast({ title: "Sub-category created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating sub-category", description: error.message, variant: "destructive" });
    },
  });
}
