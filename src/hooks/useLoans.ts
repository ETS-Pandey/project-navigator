import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useToast } from "@/hooks/use-toast";
import type { Loan, LoanCollateral, LoanPayment, LoanFormData, LoanPaymentFormData, LoanFilters, LoanStatistics } from "@/types/loans";
import { format, addMonths, differenceInDays, isAfter, isSameDay, parseISO } from "date-fns";

// Fetch all loans with optional filters
export function useLoans(filters?: LoanFilters) {
  const { currentBranch } = useBranch();

  return useQuery({
    queryKey: ["loans", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];

      let query = supabase
        .from("loans")
        .select(`
          *,
          customer:customers(id, name, phone, customer_code)
        `)
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }

      if (filters?.dateFrom) {
        query = query.gte("loan_date", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("loan_date", filters.dateTo);
      }

      if (filters?.search) {
        query = query.or(`loan_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let loans = data as Loan[];

      // Filter overdue loans client-side
      if (filters?.overdueOnly) {
        const today = new Date();
        loans = loans.filter(loan => 
          loan.status === 'active' && 
          isAfter(today, parseISO(loan.due_date))
        );
      }

      return loans;
    },
    enabled: !!currentBranch?.id,
  });
}

// Fetch single loan with all details
export function useLoan(loanId: string | undefined) {
  return useQuery({
    queryKey: ["loan", loanId],
    queryFn: async () => {
      if (!loanId) return null;

      const { data: loan, error } = await supabase
        .from("loans")
        .select(`
          *,
          customer:customers(id, name, phone, customer_code, address, email)
        `)
        .eq("id", loanId)
        .single();

      if (error) throw error;

      // Fetch collaterals
      const { data: collaterals } = await supabase
        .from("loan_collaterals")
        .select("*")
        .eq("loan_id", loanId)
        .order("created_at");

      return { ...loan, collaterals } as Loan;
    },
    enabled: !!loanId,
  });
}

// Fetch loan payments
export function useLoanPayments(loanId: string | undefined) {
  return useQuery({
    queryKey: ["loan-payments", loanId],
    queryFn: async () => {
      if (!loanId) return [];

      const { data, error } = await supabase
        .from("loan_payments")
        .select("*")
        .eq("loan_id", loanId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as LoanPayment[];
    },
    enabled: !!loanId,
  });
}

// Loan statistics
export function useLoanStatistics() {
  const { currentBranch } = useBranch();

  return useQuery({
    queryKey: ["loan-statistics", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) {
        return {
          totalActiveLoans: 0,
          totalOutstanding: 0,
          totalCollateralValue: 0,
          overdueCount: 0,
          overdueAmount: 0,
          dueTodayCount: 0,
          dueTodayAmount: 0,
        } as LoanStatistics;
      }

      const { data: loans, error } = await supabase
        .from("loans")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .eq("status", "active");

      if (error) throw error;

      const today = new Date();
      const todayStr = format(today, "yyyy-MM-dd");

      const stats: LoanStatistics = {
        totalActiveLoans: loans.length,
        totalOutstanding: loans.reduce((sum, l) => sum + Number(l.outstanding_total), 0),
        totalCollateralValue: loans.reduce((sum, l) => sum + Number(l.collateral_value), 0),
        overdueCount: 0,
        overdueAmount: 0,
        dueTodayCount: 0,
        dueTodayAmount: 0,
      };

      for (const loan of loans) {
        const dueDate = parseISO(loan.due_date);
        if (isAfter(today, dueDate)) {
          stats.overdueCount++;
          stats.overdueAmount += Number(loan.outstanding_total);
        } else if (isSameDay(today, dueDate)) {
          stats.dueTodayCount++;
          stats.dueTodayAmount += Number(loan.outstanding_total);
        }
      }

      return stats;
    },
    enabled: !!currentBranch?.id,
  });
}

// Create new loan
export function useCreateLoan() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: LoanFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");

      // Generate loan number
      const today = format(new Date(), "yyyyMMdd");
      const { count } = await supabase
        .from("loans")
        .select("*", { count: "exact", head: true })
        .ilike("loan_number", `LN-${today}%`);

      const loanNumber = `LN-${today}-${String((count || 0) + 1).padStart(3, "0")}`;

      // Calculate collateral value and net weights
      const collaterals = formData.collaterals.map(c => ({
        ...c,
        net_weight: c.gross_weight - (c.stone_weight || 0),
        item_value: (c.gross_weight - (c.stone_weight || 0)) * c.rate_per_gram,
      }));

      const collateralValue = collaterals.reduce((sum, c) => sum + c.item_value, 0);
      const loanAmount = collateralValue * 0.75; // Default 75% LTV
      const ltvPercent = (loanAmount / collateralValue) * 100;
      const dueDate = format(addMonths(parseISO(formData.loan_date), formData.tenure_months), "yyyy-MM-dd");

      // Create loan
      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .insert({
          branch_id: currentBranch.id,
          customer_id: formData.customer_id,
          loan_number: loanNumber,
          loan_date: formData.loan_date,
          collateral_value: collateralValue,
          loan_amount: loanAmount,
          ltv_percent: ltvPercent,
          interest_rate: formData.interest_rate,
          interest_type: formData.interest_type,
          tenure_months: formData.tenure_months,
          due_date: dueDate,
          outstanding_principal: loanAmount,
          outstanding_total: loanAmount,
          notes: formData.notes,
          status: "active",
        })
        .select()
        .single();

      if (loanError) throw loanError;

      // Create collaterals
      const collateralInserts = collaterals.map(c => ({
        loan_id: loan.id,
        item_description: c.item_description,
        metal_type: c.metal_type,
        purity: c.purity,
        gross_weight: c.gross_weight,
        net_weight: c.net_weight,
        stone_weight: c.stone_weight || 0,
        rate_per_gram: c.rate_per_gram,
        item_value: c.item_value,
        storage_location: c.storage_location,
        packet_number: c.packet_number,
      }));

      const { error: collateralError } = await supabase
        .from("loan_collaterals")
        .insert(collateralInserts);

      if (collateralError) throw collateralError;

      return loan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loan-statistics"] });
      toast({
        title: "Loan Created",
        description: "New gold loan has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loan",
        variant: "destructive",
      });
    },
  });
}

// Record loan payment
export function useCreateLoanPayment() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ loanId, formData }: { loanId: string; formData: LoanPaymentFormData }) => {
      if (!currentBranch?.id) throw new Error("No branch selected");

      // Generate payment number
      const today = format(new Date(), "yyyyMMdd");
      const { count } = await supabase
        .from("loan_payments")
        .select("*", { count: "exact", head: true })
        .ilike("payment_number", `LP-${today}%`);

      const paymentNumber = `LP-${today}-${String((count || 0) + 1).padStart(3, "0")}`;

      // Create payment
      const { data: payment, error: paymentError } = await supabase
        .from("loan_payments")
        .insert({
          loan_id: loanId,
          branch_id: currentBranch.id,
          payment_number: paymentNumber,
          payment_date: format(new Date(), "yyyy-MM-dd"),
          payment_type: formData.payment_type,
          amount: formData.amount,
          principal_amount: formData.principal_amount,
          interest_amount: formData.interest_amount,
          penalty_amount: formData.penalty_amount || 0,
          payment_mode: formData.payment_mode,
          reference_number: formData.reference_number,
          bank_name: formData.bank_name,
          cheque_number: formData.cheque_number,
          cheque_date: formData.cheque_date,
          upi_id: formData.upi_id,
          collateral_ids: formData.collateral_ids,
          notes: formData.notes,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Get current loan
      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .select("*")
        .eq("id", loanId)
        .single();

      if (loanError) throw loanError;

      // Update loan totals
      const newPrincipalPaid = Number(loan.principal_paid) + formData.principal_amount;
      const newInterestPaid = Number(loan.interest_paid) + formData.interest_amount;
      const newOutstandingPrincipal = Number(loan.outstanding_principal) - formData.principal_amount;
      const newOutstandingInterest = Math.max(0, Number(loan.outstanding_interest) - formData.interest_amount);
      const newOutstandingTotal = newOutstandingPrincipal + newOutstandingInterest;

      const updateData: Record<string, unknown> = {
        principal_paid: newPrincipalPaid,
        interest_paid: newInterestPaid,
        outstanding_principal: newOutstandingPrincipal,
        outstanding_interest: newOutstandingInterest,
        outstanding_total: newOutstandingTotal,
      };

      // Mark as closed if fully paid
      if (formData.payment_type === 'full_redemption' || newOutstandingPrincipal <= 0) {
        updateData.status = 'closed';
        updateData.closed_date = format(new Date(), "yyyy-MM-dd");
      }

      const { error: updateError } = await supabase
        .from("loans")
        .update(updateData)
        .eq("id", loanId);

      if (updateError) throw updateError;

      // Release collaterals if full redemption
      if (formData.payment_type === 'full_redemption') {
        await supabase
          .from("loan_collaterals")
          .update({
            is_released: true,
            released_at: new Date().toISOString(),
          })
          .eq("loan_id", loanId);
      }

      return payment;
    },
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loan", loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-payments", loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-statistics"] });
      toast({
        title: "Payment Recorded",
        description: "Loan payment has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });
}

// Calculate interest for a loan
export function calculateLoanInterest(
  principal: number,
  rate: number,
  type: 'simple' | 'compound',
  days: number
): number {
  if (type === 'simple') {
    return (principal * rate * days) / (365 * 100);
  } else {
    const months = Math.floor(days / 30);
    const monthlyRate = rate / 12 / 100;
    const amount = principal * Math.pow(1 + monthlyRate, months);
    return amount - principal;
  }
}

// Get days overdue
export function getDaysOverdue(dueDate: string): number {
  const due = parseISO(dueDate);
  const today = new Date();
  return Math.max(0, differenceInDays(today, due));
}
