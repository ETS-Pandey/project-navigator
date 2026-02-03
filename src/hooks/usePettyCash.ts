import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { PettyCashFund, PettyCashTransaction, PettyCashFormData, PettyCashTransactionFormData } from "@/types/payroll";

// =============================================
// PETTY CASH FUNDS
// =============================================

export function usePettyCashFunds() {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["petty-cash-funds", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      const { data, error } = await supabase
        .from("petty_cash_funds")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .eq("is_active", true)
        .order("fund_name");
      
      if (error) throw error;
      return data as PettyCashFund[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreatePettyCashFund() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: PettyCashFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      const { data: result, error } = await supabase
        .from("petty_cash_funds")
        .insert({
          branch_id: currentBranch.id,
          fund_name: data.fund_name,
          opening_balance: data.opening_balance,
          current_balance: data.opening_balance,
          max_single_expense: data.max_single_expense,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petty-cash-funds"] });
      toast.success("Petty cash fund created");
    },
    onError: (error) => {
      toast.error(`Failed to create fund: ${error.message}`);
    },
  });
}

// =============================================
// PETTY CASH TRANSACTIONS
// =============================================

export function usePettyCashTransactions(fundId?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["petty-cash-transactions", currentBranch?.id, fundId],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("petty_cash_transactions")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (fundId) {
        query = query.eq("fund_id", fundId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PettyCashTransaction[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreatePettyCashTransaction() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: PettyCashTransactionFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Get current balance
      const { data: fund, error: fundError } = await supabase
        .from("petty_cash_funds")
        .select("current_balance, max_single_expense")
        .eq("id", data.fund_id)
        .single();
      
      if (fundError) throw fundError;
      
      // Validate payment amount
      if (data.transaction_type === "payment") {
        if (data.amount > fund.current_balance) {
          throw new Error("Insufficient petty cash balance");
        }
        if (fund.max_single_expense && data.amount > fund.max_single_expense) {
          throw new Error(`Amount exceeds maximum single expense limit of ₹${fund.max_single_expense}`);
        }
      }
      
      // Calculate new balance
      const balanceAfter = data.transaction_type === "payment" 
        ? fund.current_balance - data.amount 
        : fund.current_balance + data.amount;
      
      const { data: result, error } = await supabase
        .from("petty_cash_transactions")
        .insert({
          fund_id: data.fund_id,
          branch_id: currentBranch.id,
          transaction_type: data.transaction_type,
          amount: data.amount,
          balance_after: balanceAfter,
          description: data.description,
          reference_number: data.reference_number,
          transaction_date: data.transaction_date,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petty-cash-funds"] });
      queryClient.invalidateQueries({ queryKey: ["petty-cash-transactions"] });
      toast.success("Transaction recorded");
    },
    onError: (error) => {
      toast.error(`Failed to record transaction: ${error.message}`);
    },
  });
}

export function useReplenishPettyCash() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async ({ fundId, amount, reference }: { fundId: string; amount: number; reference?: string }) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Get current balance
      const { data: fund, error: fundError } = await supabase
        .from("petty_cash_funds")
        .select("current_balance")
        .eq("id", fundId)
        .single();
      
      if (fundError) throw fundError;
      
      const balanceAfter = fund.current_balance + amount;
      
      const { data: result, error } = await supabase
        .from("petty_cash_transactions")
        .insert({
          fund_id: fundId,
          branch_id: currentBranch.id,
          transaction_type: "replenishment",
          amount: amount,
          balance_after: balanceAfter,
          description: "Petty cash replenishment",
          reference_number: reference,
          transaction_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petty-cash-funds"] });
      queryClient.invalidateQueries({ queryKey: ["petty-cash-transactions"] });
      toast.success("Petty cash replenished");
    },
    onError: (error) => {
      toast.error(`Failed to replenish: ${error.message}`);
    },
  });
}
