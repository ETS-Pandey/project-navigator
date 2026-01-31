import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Karigar, KarigarFormData } from "@/types/karigar";

export function useKarigars() {
  const { currentBranch } = useBranch();

  return useQuery({
    queryKey: ["karigars", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return [];

      const { data, error } = await supabase
        .from("karigars")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("name");

      if (error) throw error;
      return data as Karigar[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useKarigar(karigarId: string) {
  return useQuery({
    queryKey: ["karigar", karigarId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("karigars")
        .select("*")
        .eq("id", karigarId)
        .single();

      if (error) throw error;
      return data as Karigar;
    },
    enabled: !!karigarId,
  });
}

export function useCreateKarigar() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: KarigarFormData) => {
      if (!currentBranch?.id) {
        throw new Error("No branch selected");
      }

      const { data: result, error } = await supabase
        .from("karigars")
        .insert([{
          branch_id: currentBranch.id,
          name: data.name,
          code: data.code,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          pincode: data.pincode || null,
          aadhar: data.aadhar || null,
          pan: data.pan || null,
          specialization: data.specialization || null,
          commission_rate: data.commission_rate || 0,
          notes: data.notes || null,
          is_active: data.is_active ?? true,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["karigars"] });
      toast({ title: "Karigar added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding karigar", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateKarigar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Karigar> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("karigars")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["karigars"] });
      queryClient.invalidateQueries({ queryKey: ["karigar", variables.id] });
      toast({ title: "Karigar updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating karigar", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteKarigar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("karigars")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["karigars"] });
      toast({ title: "Karigar deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting karigar", description: error.message, variant: "destructive" });
    },
  });
}
