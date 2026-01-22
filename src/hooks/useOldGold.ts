import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { OldGoldPurchase, OldGoldFormData, OldGoldStatus } from "@/types/billing";

interface OldGoldFilters {
  status?: OldGoldStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useOldGoldPurchases(filters?: OldGoldFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["old-gold-purchases", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("old_gold_purchases")
        .select(`
          *,
          customer:customers(*)
        `)
        .eq("branch_id", currentBranch.id)
        .order("purchase_date", { ascending: false });
      
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters?.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }
      
      if (filters?.dateFrom) {
        query = query.gte("purchase_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("purchase_date", filters.dateTo);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OldGoldPurchase[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useOldGoldPurchase(purchaseId: string) {
  return useQuery({
    queryKey: ["old-gold-purchase", purchaseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("old_gold_purchases")
        .select(`
          *,
          customer:customers(*)
        `)
        .eq("id", purchaseId)
        .single();
      
      if (error) throw error;
      return data as OldGoldPurchase;
    },
    enabled: !!purchaseId,
  });
}

export function useCreateOldGoldPurchase() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: OldGoldFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Calculate values
      const deductionWeight = data.gross_weight * (data.deduction_percent / 100);
      const netWeight = data.gross_weight - deductionWeight;
      const grossValue = data.gross_weight * data.rate_per_gram;
      const deductionAmount = grossValue * (data.deduction_percent / 100);
      const netValue = grossValue - deductionAmount;
      
      // Generate purchase number
      const today = new Date();
      const prefix = `OG-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
      
      const { count } = await supabase
        .from("old_gold_purchases")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", currentBranch.id)
        .ilike("purchase_number", `${prefix}%`);
      
      const purchaseNumber = `${prefix}-${String((count || 0) + 1).padStart(4, "0")}`;
      
      const { data: purchase, error } = await supabase
        .from("old_gold_purchases")
        .insert([{
          branch_id: currentBranch.id,
          purchase_number: purchaseNumber,
          customer_id: data.customer_id,
          metal_type: data.metal_type as "gold" | "silver" | "platinum" | "palladium",
          purity: data.purity,
          gross_weight: data.gross_weight,
          deduction_percent: data.deduction_percent,
          deduction_weight: deductionWeight,
          net_weight: netWeight,
          rate_per_gram: data.rate_per_gram,
          gross_value: grossValue,
          deduction_amount: deductionAmount,
          net_value: netValue,
          testing_method: data.testing_method,
          notes: data.notes,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["old-gold-purchases"] });
      toast.success("Old gold purchase recorded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to record purchase: ${error.message}`);
    },
  });
}

export function useUpdateOldGoldStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OldGoldStatus }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (status === "approved") {
        const { data: { user } } = await supabase.auth.getUser();
        updateData.approved_by = user?.id;
        updateData.approved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from("old_gold_purchases")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["old-gold-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["old-gold-purchase", variables.id] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}
