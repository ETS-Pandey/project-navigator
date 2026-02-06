import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Appraisal, AppraisalItem } from "@/types/appraisal";

export function useAppraisals(status?: string) {
  const { currentBranch } = useBranch();
  return useQuery({
    queryKey: ["appraisals", currentBranch?.id, status],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      let query = supabase
        .from("appraisals")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data as Appraisal[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useAppraisal(appraisalId: string) {
  return useQuery({
    queryKey: ["appraisal", appraisalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appraisals")
        .select("*, appraisal_items(*)")
        .eq("id", appraisalId)
        .single();
      if (error) throw error;
      return data as Appraisal;
    },
    enabled: !!appraisalId,
  });
}

export function useCreateAppraisal() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      customer_id?: string;
      customer_name?: string;
      customer_phone?: string;
      purpose: string;
      appraised_by?: string;
      market_rate_gold?: number;
      market_rate_silver?: number;
      notes?: string;
      items: Omit<AppraisalItem, 'id' | 'appraisal_id' | 'created_at'>[];
    }) => {
      if (!currentBranch?.id || !user?.id) throw new Error("No branch or user");
      const timestamp = Date.now().toString(36).toUpperCase();

      const totalWeight = data.items.reduce((s, i) => s + (i.gross_weight || 0), 0);
      const totalMetalValue = data.items.reduce((s, i) => s + (i.metal_value || 0), 0);
      const totalStoneValue = data.items.reduce((s, i) => s + (i.stone_value || 0), 0);
      const totalMakingValue = data.items.reduce((s, i) => s + (i.making_charge_value || 0), 0);
      const grandTotal = data.items.reduce((s, i) => s + (i.total_value || 0), 0);
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const { data: appraisal, error } = await supabase
        .from("appraisals")
        .insert([{
          branch_id: currentBranch.id,
          appraisal_number: `APR-${timestamp}`,
          customer_id: data.customer_id || null,
          customer_name: data.customer_name || null,
          customer_phone: data.customer_phone || null,
          purpose: data.purpose || 'valuation',
          total_items: data.items.length,
          total_weight: totalWeight,
          total_metal_value: totalMetalValue,
          total_stone_value: totalStoneValue,
          total_making_value: totalMakingValue,
          grand_total: grandTotal,
          market_rate_gold: data.market_rate_gold || null,
          market_rate_silver: data.market_rate_silver || null,
          appraised_by: data.appraised_by || null,
          valid_until: validUntil.toISOString().split("T")[0],
          notes: data.notes || null,
          status: 'completed',
          created_by: user.id,
        }])
        .select()
        .single();
      if (error) throw error;

      // Insert appraisal items
      if (data.items.length > 0) {
        const itemRecords = data.items.map((item, idx) => ({
          appraisal_id: appraisal.id,
          item_number: idx + 1,
          description: item.description,
          metal_type: item.metal_type || 'gold',
          purity: item.purity,
          gross_weight: item.gross_weight,
          stone_weight: item.stone_weight || 0,
          net_weight: item.net_weight,
          wastage_percent: item.wastage_percent || 0,
          rate_per_gram: item.rate_per_gram,
          metal_value: item.metal_value,
          stone_type: item.stone_type || null,
          stone_count: item.stone_count || 0,
          stone_carat: item.stone_carat || 0,
          stone_value: item.stone_value || 0,
          making_charge_value: item.making_charge_value || 0,
          total_value: item.total_value,
          condition: item.condition || 'good',
          hallmark_status: item.hallmark_status || null,
          huid: item.huid || null,
          notes: item.notes || null,
        }));
        const { error: itemsError } = await supabase
          .from("appraisal_items")
          .insert(itemRecords);
        if (itemsError) throw itemsError;
      }

      return appraisal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisals"] });
      toast({ title: "Appraisal created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating appraisal", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateAppraisalStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, certificate_number }: { id: string; status: string; certificate_number?: string }) => {
      const updateData: Record<string, any> = { status };
      if (certificate_number) {
        updateData.certificate_number = certificate_number;
        updateData.certificate_issued = true;
      }
      const { data, error } = await supabase
        .from("appraisals")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appraisals"] });
      queryClient.invalidateQueries({ queryKey: ["appraisal", variables.id] });
      toast({ title: "Appraisal status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    },
  });
}
