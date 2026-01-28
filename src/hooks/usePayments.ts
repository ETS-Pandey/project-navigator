import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import { createPaymentJournalEntry } from "@/hooks/useJournalEntryCreation";
import type { Payment, PaymentFormData, PaymentMode } from "@/types/billing";

interface PaymentFilters {
  invoiceId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  mode?: PaymentMode;
}

export function usePayments(filters?: PaymentFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["payments", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("payments")
        .select(`
          *,
          customer:customers(*),
          invoice:invoices(*)
        `)
        .eq("branch_id", currentBranch.id)
        .order("payment_date", { ascending: false });
      
      if (filters?.invoiceId) {
        query = query.eq("invoice_id", filters.invoiceId);
      }
      
      if (filters?.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }
      
      if (filters?.dateFrom) {
        query = query.gte("payment_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("payment_date", filters.dateTo);
      }
      
      if (filters?.mode) {
        query = query.eq("payment_mode", filters.mode);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: PaymentFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate payment number
      const today = new Date();
      const prefix = `PAY-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
      
      const { count } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", currentBranch.id)
        .ilike("payment_number", `${prefix}%`);
      
      const paymentNumber = `${prefix}-${String((count || 0) + 1).padStart(4, "0")}`;
      
      // Clean up data - convert empty strings to null for optional fields
      const cleanedData = {
        payment_mode: data.payment_mode,
        amount: data.amount,
        invoice_id: data.invoice_id || null,
        customer_id: data.customer_id || null,
        reference_number: data.reference_number || null,
        bank_name: data.bank_name || null,
        cheque_number: data.cheque_number || null,
        cheque_date: data.cheque_date || null,
        upi_id: data.upi_id || null,
        notes: data.notes || null,
        branch_id: currentBranch.id,
        payment_number: paymentNumber,
        payment_date: today.toISOString().split('T')[0],
      };
      
      const { data: payment, error } = await supabase
        .from("payments")
        .insert(cleanedData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update invoice if linked
      if (data.invoice_id) {
        const { data: invoice } = await supabase
          .from("invoices")
          .select("amount_paid, grand_total, invoice_number")
          .eq("id", data.invoice_id)
          .single();
        
        if (invoice) {
          const newAmountPaid = Number(invoice.amount_paid) + data.amount;
          const newBalanceDue = Number(invoice.grand_total) - newAmountPaid;
          const newStatus = newBalanceDue <= 0 ? "paid" : "partially_paid";
          
          await supabase
            .from("invoices")
            .update({
              amount_paid: newAmountPaid,
              balance_due: Math.max(0, newBalanceDue),
              status: newStatus,
            })
            .eq("id", data.invoice_id);

          // Create journal entry for the payment with invoice number
          await createPaymentJournalEntry(
            currentBranch.id,
            payment.id,
            paymentNumber,
            payment.payment_date,
            data.amount,
            data.payment_mode,
            invoice.invoice_number
          );
        }
      } else {
        // Create journal entry for the payment without invoice reference
        await createPaymentJournalEntry(
          currentBranch.id,
          payment.id,
          paymentNumber,
          payment.payment_date,
          data.amount,
          data.payment_mode
        );
      }
      
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-payments"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["daybook-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-financial"] });
      queryClient.invalidateQueries({ queryKey: ["customer-history"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });
}
