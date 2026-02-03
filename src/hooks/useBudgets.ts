import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { Budget, BudgetFormData } from "@/types/payroll";

// =============================================
// BUDGETS
// =============================================

export function useBudgets(periodType?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["budgets", currentBranch?.id, periodType],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("budgets")
        .select(`
          *,
          category:expense_categories(id, name)
        `)
        .eq("branch_id", currentBranch.id)
        .eq("is_active", true)
        .order("period_start", { ascending: false });
      
      if (periodType) {
        query = query.eq("period_type", periodType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useActiveBudgets() {
  const { currentBranch } = useBranch();
  const today = new Date().toISOString().split("T")[0];
  
  return useQuery({
    queryKey: ["active-budgets", currentBranch?.id, today],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          category:expense_categories(id, name)
        `)
        .eq("branch_id", currentBranch.id)
        .eq("is_active", true)
        .lte("period_start", today)
        .gte("period_end", today)
        .order("budget_name");
      
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: BudgetFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      const { data: result, error } = await supabase
        .from("budgets")
        .insert({
          branch_id: currentBranch.id,
          category_id: data.category_id || null,
          budget_name: data.budget_name,
          period_type: data.period_type,
          period_start: data.period_start,
          period_end: data.period_end,
          budgeted_amount: data.budgeted_amount,
          alert_threshold_percent: data.alert_threshold_percent || 80,
          notes: data.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["active-budgets"] });
      toast.success("Budget created");
    },
    onError: (error) => {
      toast.error(`Failed to create budget: ${error.message}`);
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Budget> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("budgets")
        .update({
          budget_name: data.budget_name,
          budgeted_amount: data.budgeted_amount,
          alert_threshold_percent: data.alert_threshold_percent,
          notes: data.notes,
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["active-budgets"] });
      toast.success("Budget updated");
    },
    onError: (error) => {
      toast.error(`Failed to update budget: ${error.message}`);
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase
        .from("budgets")
        .update({ is_active: false })
        .eq("id", budgetId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["active-budgets"] });
      toast.success("Budget deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete budget: ${error.message}`);
    },
  });
}

// Budget Alerts - budgets that have exceeded threshold
export function useBudgetAlerts() {
  const { data: budgets = [] } = useActiveBudgets();
  
  return budgets.filter(
    (b) => b.utilization_percent >= (b.alert_threshold_percent || 80)
  );
}
