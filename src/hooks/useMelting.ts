import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { MeltingBatch, RefiningRecord } from "@/types/melting";

export function useMeltingBatches(status?: string) {
  const { currentBranch } = useBranch();
  return useQuery({
    queryKey: ["melting_batches", currentBranch?.id, status],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      let query = supabase
        .from("melting_batches")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        input_items: (d.input_items || []) as unknown as MeltingBatch['input_items'],
        output_allocation: (d.output_allocation || []) as unknown as MeltingBatch['output_allocation'],
      })) as MeltingBatch[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useMeltingBatch(batchId: string) {
  return useQuery({
    queryKey: ["melting_batch", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("melting_batches")
        .select("*")
        .eq("id", batchId)
        .single();
      if (error) throw error;
      return {
        ...data,
        input_items: (data.input_items || []) as unknown as MeltingBatch['input_items'],
        output_allocation: (data.output_allocation || []) as unknown as MeltingBatch['output_allocation'],
      } as MeltingBatch;
    },
    enabled: !!batchId,
  });
}

export function useCreateMeltingBatch() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<MeltingBatch>) => {
      if (!currentBranch?.id || !user?.id) throw new Error("No branch or user");
      const timestamp = Date.now().toString(36).toUpperCase();
      const inputItems = data.input_items || [];
      const totalWeight = inputItems.reduce((sum, item) => sum + (item.weight || 0), 0);

      const { data: result, error } = await supabase
        .from("melting_batches")
        .insert([{
          branch_id: currentBranch.id,
          batch_number: `MB-${timestamp}`,
          batch_date: data.batch_date || new Date().toISOString().split("T")[0],
          metal_type: data.metal_type || 'gold',
          input_total_weight: totalWeight,
          input_items: JSON.parse(JSON.stringify(inputItems)),
          expected_pure_weight: data.expected_pure_weight || null,
          refiner_name: data.refiner_name || null,
          refining_charges: data.refining_charges || 0,
          notes: data.notes || null,
          created_by: user.id,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["melting_batches"] });
      toast({ title: "Melting batch created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating batch", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateMeltingBatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MeltingBatch> & { id: string }) => {
      const updateData: Record<string, any> = { ...data };
      if (data.input_items) updateData.input_items = JSON.parse(JSON.stringify(data.input_items));
      if (data.output_allocation) updateData.output_allocation = JSON.parse(JSON.stringify(data.output_allocation));

      const { data: result, error } = await supabase
        .from("melting_batches")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["melting_batches"] });
      queryClient.invalidateQueries({ queryKey: ["melting_batch", variables.id] });
      toast({ title: "Batch updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating batch", description: error.message, variant: "destructive" });
    },
  });
}

export function useRefiningRecords(batchId?: string) {
  const { currentBranch } = useBranch();
  return useQuery({
    queryKey: ["refining_records", currentBranch?.id, batchId],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      let query = supabase
        .from("refining_records")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });
      if (batchId) query = query.eq("melting_batch_id", batchId);
      const { data, error } = await query;
      if (error) throw error;
      return data as RefiningRecord[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreateRefiningRecord() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<RefiningRecord>) => {
      if (!currentBranch?.id || !user?.id) throw new Error("No branch or user");
      const timestamp = Date.now().toString(36).toUpperCase();
      const { data: result, error } = await supabase
        .from("refining_records")
        .insert([{
          branch_id: currentBranch.id,
          melting_batch_id: data.melting_batch_id || null,
          record_number: `RF-${timestamp}`,
          test_date: data.test_date || new Date().toISOString().split("T")[0],
          metal_type: data.metal_type || 'gold',
          sample_weight: data.sample_weight || 0,
          tested_purity: data.tested_purity || '',
          pure_metal_content: data.pure_metal_content || null,
          testing_method: data.testing_method || null,
          tested_by: data.tested_by || null,
          lab_name: data.lab_name || null,
          lab_certificate: data.lab_certificate || null,
          notes: data.notes || null,
          created_by: user.id,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refining_records"] });
      toast({ title: "Refining record created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating record", description: error.message, variant: "destructive" });
    },
  });
}
