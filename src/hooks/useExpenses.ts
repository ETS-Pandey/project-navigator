import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { Expense, ExpenseCategory, ExpenseFormData } from "@/types/expenses";
import { createExpenseJournalEntry } from "./useJournalEntryCreation";

interface ExpenseFilters {
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMode?: string;
}

// =============================================
// EXPENSE CATEGORIES
// =============================================

export function useExpenseCategories() {
  return useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as ExpenseCategory[];
    },
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("expense_categories")
        .insert({
          name: data.name,
          description: data.description || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
}

// =============================================
// EXPENSES
// =============================================

export function useExpenses(filters?: ExpenseFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["expenses", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("expenses")
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq("branch_id", currentBranch.id)
        .order("expense_date", { ascending: false });
      
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      
      if (filters?.dateFrom) {
        query = query.gte("expense_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("expense_date", filters.dateTo);
      }
      
      if (filters?.paymentMode) {
        query = query.eq("payment_mode", filters.paymentMode as "cash" | "upi" | "card" | "bank_transfer" | "cheque");
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useExpense(expenseId: string) {
  return useQuery({
    queryKey: ["expense", expenseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq("id", expenseId)
        .single();
      
      if (error) throw error;
      return data as Expense;
    },
    enabled: !!expenseId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: ExpenseFormData & { category_name?: string }) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate expense number
      const { data: lastExpense } = await supabase
        .from("expenses")
        .select("expense_number")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      const lastNum = lastExpense?.expense_number 
        ? parseInt(lastExpense.expense_number.replace(/\D/g, "")) 
        : 0;
      const expenseNumber = `EXP${String(lastNum + 1).padStart(5, "0")}`;
      
      const insertData = {
        branch_id: currentBranch.id,
        expense_number: expenseNumber,
        category_id: data.category_id || null,
        amount: data.amount,
        payment_mode: data.payment_mode as "cash" | "upi" | "card" | "bank_transfer" | "cheque",
        expense_date: data.expense_date,
        vendor_name: data.vendor_name || null,
        description: data.description || null,
        reference_number: data.reference_number || null,
        is_gst_applicable: data.is_gst_applicable || false,
        gst_amount: data.gst_amount || null,
        status: "approved", // Auto-approve expenses
      };
      
      const { data: result, error } = await supabase
        .from("expenses")
        .insert(insertData as never)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create journal entry for the expense
      await createExpenseJournalEntry(
        currentBranch.id,
        result.id,
        expenseNumber,
        data.expense_date,
        data.amount,
        data.payment_mode,
        data.category_name,
        data.is_gst_applicable ? data.gst_amount : undefined
      );
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["daybook-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-financial"] });
      toast.success("Expense recorded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to record expense: ${error.message}`);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete expense: ${error.message}`);
    },
  });
}

// Stats
export function useExpenseStats(dateFrom?: string, dateTo?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["expense-stats", currentBranch?.id, dateFrom, dateTo],
    queryFn: async () => {
      if (!currentBranch?.id) return null;
      
      let query = supabase
        .from("expenses")
        .select("amount, category:expense_categories(name)")
        .eq("branch_id", currentBranch.id);
      
      if (dateFrom) {
        query = query.gte("expense_date", dateFrom);
      }
      
      if (dateTo) {
        query = query.lte("expense_date", dateTo);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const totalAmount = data.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const byCategory: Record<string, number> = {};
      
      data.forEach((exp) => {
        const catName = exp.category?.name || "Uncategorized";
        byCategory[catName] = (byCategory[catName] || 0) + Number(exp.amount);
      });
      
      return {
        totalAmount,
        count: data.length,
        byCategory,
      };
    },
    enabled: !!currentBranch?.id,
  });
}
