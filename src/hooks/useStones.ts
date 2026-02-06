import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { StoneType, StoneLot, StoneInventoryItem } from "@/types/stones";

export function useStoneTypes() {
  return useQuery({
    queryKey: ["stone_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stone_types")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as StoneType[];
    },
  });
}

export function useStoneLots() {
  const { currentBranch } = useBranch();
  return useQuery({
    queryKey: ["stone_lots", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      const { data, error } = await supabase
        .from("stone_lots")
        .select("*, stone_type:stone_types(*)")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StoneLot[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useStoneInventory(filters?: { stoneTypeId?: string; status?: string }) {
  const { currentBranch } = useBranch();
  return useQuery({
    queryKey: ["stone_inventory", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      let query = supabase
        .from("stone_inventory")
        .select("*, stone_type:stone_types(*)")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });
      if (filters?.stoneTypeId) query = query.eq("stone_type_id", filters.stoneTypeId);
      if (filters?.status) query = query.eq("status", filters.status);
      const { data, error } = await query;
      if (error) throw error;
      return data as StoneInventoryItem[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreateStoneLot() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<StoneLot>) => {
      if (!currentBranch?.id || !user?.id) throw new Error("No branch or user");
      const timestamp = Date.now().toString(36).toUpperCase();
      const { data: result, error } = await supabase
        .from("stone_lots")
        .insert([{
          branch_id: currentBranch.id,
          stone_type_id: data.stone_type_id,
          lot_number: `SL-${timestamp}`,
          supplier_name: data.supplier_name || null,
          purchase_date: data.purchase_date || new Date().toISOString().split("T")[0],
          total_pieces: data.total_pieces || 0,
          total_carat_weight: data.total_carat_weight || 0,
          total_cost: data.total_cost || 0,
          cost_per_carat: data.total_carat_weight && data.total_cost
            ? Number((data.total_cost / data.total_carat_weight).toFixed(2))
            : 0,
          available_pieces: data.total_pieces || 0,
          available_carat_weight: data.total_carat_weight || 0,
          shape: data.shape || null,
          color_grade: data.color_grade || null,
          clarity_grade: data.clarity_grade || null,
          cut_grade: data.cut_grade || null,
          certification: data.certification || null,
          certificate_number: data.certificate_number || null,
          notes: data.notes || null,
          created_by: user.id,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stone_lots"] });
      toast({ title: "Stone lot created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating stone lot", description: error.message, variant: "destructive" });
    },
  });
}

export function useCreateStoneItem() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<StoneInventoryItem>) => {
      if (!currentBranch?.id || !user?.id) throw new Error("No branch or user");
      const timestamp = Date.now().toString(36).toUpperCase();
      const { data: result, error } = await supabase
        .from("stone_inventory")
        .insert([{
          branch_id: currentBranch.id,
          stone_type_id: data.stone_type_id,
          lot_id: data.lot_id || null,
          stone_code: `ST-${timestamp}`,
          carat_weight: data.carat_weight || 0,
          shape: data.shape || null,
          color_grade: data.color_grade || null,
          clarity_grade: data.clarity_grade || null,
          cut_grade: data.cut_grade || null,
          dimensions: data.dimensions || null,
          certification: data.certification || null,
          certificate_number: data.certificate_number || null,
          cost_price: data.cost_price || 0,
          market_value: data.market_value || null,
          location: data.location || null,
          notes: data.notes || null,
          created_by: user.id,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stone_inventory"] });
      toast({ title: "Stone added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding stone", description: error.message, variant: "destructive" });
    },
  });
}

export function useCreateStoneMovement() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { stone_inventory_id?: string; lot_id?: string; movement_type: string; quantity?: number; carat_weight?: number; karigar_id?: string; product_id?: string; notes?: string }) => {
      if (!currentBranch?.id || !user?.id) throw new Error("No branch or user");
      const { data: result, error } = await supabase
        .from("stone_movements")
        .insert([{
          branch_id: currentBranch.id,
          stone_inventory_id: data.stone_inventory_id || null,
          lot_id: data.lot_id || null,
          movement_type: data.movement_type,
          quantity: data.quantity || 1,
          carat_weight: data.carat_weight || null,
          karigar_id: data.karigar_id || null,
          product_id: data.product_id || null,
          notes: data.notes || null,
          created_by: user.id,
        }])
        .select()
        .single();
      if (error) throw error;

      // Update stone inventory status if individual stone
      if (data.stone_inventory_id) {
        const statusMap: Record<string, string> = {
          issue_to_karigar: 'issued',
          return_from_karigar: 'available',
          set_in_product: 'set',
          loss: 'lost',
        };
        const newStatus = statusMap[data.movement_type];
        if (newStatus) {
          await supabase.from("stone_inventory").update({
            status: newStatus,
            assigned_karigar_id: data.movement_type === 'issue_to_karigar' ? data.karigar_id : null,
            assigned_product_id: data.movement_type === 'set_in_product' ? data.product_id : null,
          }).eq("id", data.stone_inventory_id);
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stone_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stone_lots"] });
      toast({ title: "Stone movement recorded" });
    },
    onError: (error: Error) => {
      toast({ title: "Error recording movement", description: error.message, variant: "destructive" });
    },
  });
}
