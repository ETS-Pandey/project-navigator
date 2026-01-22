import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { ChartOfAccount, JournalEntry, JournalEntryLine, JournalEntryFormData, AccountType } from "@/types/accounting";

// =============================================
// CHART OF ACCOUNTS
// =============================================

export function useChartOfAccounts(accountType?: AccountType) {
  return useQuery({
    queryKey: ["chart-of-accounts", accountType],
    queryFn: async () => {
      let query = supabase
        .from("chart_of_accounts")
        .select("*")
        .eq("is_active", true)
        .order("account_code");
      
      if (accountType) {
        query = query.eq("account_type", accountType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ChartOfAccount[];
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      account_code: string;
      account_name: string;
      account_type: AccountType;
      description?: string;
      opening_balance?: number;
    }) => {
      const { data: result, error } = await supabase
        .from("chart_of_accounts")
        .insert({
          account_code: data.account_code,
          account_name: data.account_name,
          account_type: data.account_type,
          description: data.description || null,
          opening_balance: data.opening_balance || 0,
          current_balance: data.opening_balance || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create account: ${error.message}`);
    },
  });
}

// =============================================
// JOURNAL ENTRIES (Day Book)
// =============================================

interface JournalFilters {
  dateFrom?: string;
  dateTo?: string;
  referenceType?: string;
}

export function useJournalEntries(filters?: JournalFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["journal-entries", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("journal_entries")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("entry_date", { ascending: false });
      
      if (filters?.dateFrom) {
        query = query.gte("entry_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("entry_date", filters.dateTo);
      }
      
      if (filters?.referenceType) {
        query = query.eq("reference_type", filters.referenceType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useJournalEntry(entryId: string) {
  return useQuery({
    queryKey: ["journal-entry", entryId],
    queryFn: async () => {
      const { data: entry, error: entryError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();
      
      if (entryError) throw entryError;
      
      const { data: lines, error: linesError } = await supabase
        .from("journal_entry_lines")
        .select(`
          *,
          account:chart_of_accounts(*)
        `)
        .eq("journal_entry_id", entryId);
      
      if (linesError) throw linesError;
      
      return {
        ...entry,
        lines,
      } as JournalEntry;
    },
    enabled: !!entryId,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: JournalEntryFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Calculate totals
      const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error("Debit and Credit totals must be equal");
      }
      
      // Generate entry number
      const { data: lastEntry } = await supabase
        .from("journal_entries")
        .select("entry_number")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      const lastNum = lastEntry?.entry_number 
        ? parseInt(lastEntry.entry_number.replace(/\D/g, "")) 
        : 0;
      const entryNumber = `JE${String(lastNum + 1).padStart(6, "0")}`;
      
      // Create journal entry
      const { data: entry, error: entryError } = await supabase
        .from("journal_entries")
        .insert({
          branch_id: currentBranch.id,
          entry_number: entryNumber,
          entry_date: data.entry_date,
          narration: data.narration || null,
          reference_type: "manual",
          total_debit: totalDebit,
          total_credit: totalCredit,
        })
        .select()
        .single();
      
      if (entryError) throw entryError;
      
      // Create entry lines
      const linesToInsert = data.lines.map((line) => ({
        journal_entry_id: entry.id,
        account_id: line.account_id,
        debit_amount: line.debit_amount || 0,
        credit_amount: line.credit_amount || 0,
        narration: line.narration || null,
      }));
      
      const { error: linesError } = await supabase
        .from("journal_entry_lines")
        .insert(linesToInsert);
      
      if (linesError) throw linesError;
      
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      toast.success("Journal entry created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });
}

// =============================================
// LEDGER VIEW
// =============================================

export function useAccountLedger(accountId: string, dateFrom?: string, dateTo?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["account-ledger", accountId, currentBranch?.id, dateFrom, dateTo],
    queryFn: async () => {
      if (!currentBranch?.id || !accountId) return [];
      
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          *,
          journal_entry:journal_entries(*)
        `)
        .eq("account_id", accountId);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by branch and date in JS (since we join)
      let filtered = data.filter((line) => 
        line.journal_entry?.branch_id === currentBranch.id
      );
      
      if (dateFrom) {
        filtered = filtered.filter((line) => 
          line.journal_entry?.entry_date >= dateFrom
        );
      }
      
      if (dateTo) {
        filtered = filtered.filter((line) => 
          line.journal_entry?.entry_date <= dateTo
        );
      }
      
      // Sort by date
      filtered.sort((a, b) => 
        new Date(a.journal_entry?.entry_date || 0).getTime() - 
        new Date(b.journal_entry?.entry_date || 0).getTime()
      );
      
      return filtered as (JournalEntryLine & { journal_entry: JournalEntry })[];
    },
    enabled: !!accountId && !!currentBranch?.id,
  });
}

// =============================================
// DAY BOOK STATS
// =============================================

export function useDayBookStats(date?: string) {
  const { currentBranch } = useBranch();
  const targetDate = date || new Date().toISOString().split("T")[0];
  
  return useQuery({
    queryKey: ["daybook-stats", currentBranch?.id, targetDate],
    queryFn: async () => {
      if (!currentBranch?.id) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("total_debit, total_credit, reference_type")
        .eq("branch_id", currentBranch.id)
        .eq("entry_date", targetDate);
      
      if (error) throw error;
      
      const totalDebit = data.reduce((sum, e) => sum + Number(e.total_debit), 0);
      const totalCredit = data.reduce((sum, e) => sum + Number(e.total_credit), 0);
      const entryCount = data.length;
      
      const byType: Record<string, number> = {};
      data.forEach((e) => {
        const type = e.reference_type || "manual";
        byType[type] = (byType[type] || 0) + 1;
      });
      
      return {
        totalDebit,
        totalCredit,
        entryCount,
        byType,
      };
    },
    enabled: !!currentBranch?.id,
  });
}
