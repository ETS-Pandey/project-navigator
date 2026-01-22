import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Branch, PrintTemplate } from "@/types/settings";
import { Json } from "@/integrations/supabase/types";

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("is_main_branch", { ascending: false })
        .order("name");

      if (error) throw error;
      return data as Branch[];
    },
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (branch: Omit<Branch, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("branches")
        .insert(branch)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Branch created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error creating branch",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Branch> & { id: string }) => {
      const { data, error } = await supabase
        .from("branches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Branch updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error updating branch",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePrintTemplates() {
  return useQuery({
    queryKey: ["print-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("print_templates")
        .select("*")
        .order("template_type")
        .order("is_default", { ascending: false });

      if (error) throw error;
      return data as PrintTemplate[];
    },
  });
}

export function useUpdatePrintTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PrintTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("print_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["print-templates"] });
      toast({ title: "Template updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error updating template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBusinessSettings(settingKey: string) {
  return useQuery({
    queryKey: ["business-settings", settingKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .eq("setting_key", settingKey)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertBusinessSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      setting_key,
      setting_value,
      branch_id = null,
    }: {
      setting_key: string;
      setting_value: Record<string, unknown>;
      branch_id?: string | null;
    }) => {
      // First try to find existing setting
      let query = supabase
        .from("business_settings")
        .select("id")
        .eq("setting_key", setting_key);
      
      if (branch_id === null) {
        query = query.is("branch_id", null);
      } else {
        query = query.eq("branch_id", branch_id);
      }
      
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("business_settings")
          .update({ setting_value: setting_value as unknown as Json })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("business_settings")
          .insert({ 
            setting_key, 
            setting_value: setting_value as unknown as Json, 
            branch_id 
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["business-settings", variables.setting_key] });
      toast({ title: "Settings saved successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
