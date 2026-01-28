import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import { createInvoiceJournalEntry } from "@/hooks/useJournalEntryCreation";
import type { Invoice, InvoiceItem, InvoiceItemFormData, InvoiceStatus } from "@/types/billing";

interface InvoiceFilters {
  status?: InvoiceStatus;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
}

export function useInvoices(filters?: InvoiceFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["invoices", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("invoices")
        .select(`
          *,
          customer:customers(*)
        `)
        .eq("branch_id", currentBranch.id)
        .order("invoice_date", { ascending: false });
      
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters?.type) {
        query = query.eq("invoice_type", filters.type);
      }
      
      if (filters?.dateFrom) {
        query = query.gte("invoice_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("invoice_date", filters.dateTo);
      }
      
      if (filters?.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select(`
          *,
          customer:customers(*)
        `)
        .eq("id", invoiceId)
        .single();
      
      if (invoiceError) throw invoiceError;
      
      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("display_order");
      
      if (itemsError) throw itemsError;
      
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("payment_date");
      
      if (paymentsError) throw paymentsError;
      
      return {
        ...invoice,
        items,
        payments,
      } as Invoice;
    },
    enabled: !!invoiceId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async ({
      invoiceData,
      items,
    }: {
      invoiceData: Partial<Invoice>;
      items: InvoiceItemFormData[];
    }) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate invoice number
      const today = new Date();
      const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
      
      const { count } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", currentBranch.id)
        .ilike("invoice_number", `${prefix}%`);
      
      const invoiceNumber = `${prefix}-${String((count || 0) + 1).padStart(4, "0")}`;
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          ...invoiceData,
          branch_id: currentBranch.id,
          invoice_number: invoiceNumber,
        })
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Create invoice items
      if (items.length > 0) {
        const invoiceItems = items.map((item, index) => ({
          invoice_id: invoice.id,
          item_name: item.item_name,
          hsn_code: item.hsn_code,
          product_id: item.product_id,
          item_code: item.item_code,
          description: item.description,
          metal_type: item.metal_type as "gold" | "silver" | "platinum" | "palladium" | undefined,
          purity: item.purity,
          gross_weight: item.gross_weight,
          net_weight: item.net_weight,
          rate_per_gram: item.rate_per_gram,
          metal_value: item.metal_value,
          making_charge_type: item.making_charge_type as "per_gram" | "percentage" | "flat" | undefined,
          making_charge_value: item.making_charge_value,
          making_charges: item.making_charges,
          stone_value: item.stone_value,
          other_charges: item.other_charges,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          display_order: index,
        }));
        
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(invoiceItems);
        
        if (itemsError) throw itemsError;
      }

      // Create journal entry for confirmed invoices
      if (invoiceData.status === "confirmed" && invoice.grand_total > 0) {
        await createInvoiceJournalEntry(
          currentBranch.id,
          invoice.id,
          invoiceNumber,
          invoice.invoice_date,
          invoice.grand_total,
          invoice.cgst_amount || 0,
          invoice.sgst_amount || 0,
          invoice.igst_amount || 0
        );
      }
      
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      invoiceData,
      items,
    }: {
      id: string;
      invoiceData: Partial<Invoice>;
      items?: InvoiceItemFormData[];
    }) => {
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      if (items) {
        // Delete existing items and recreate
        await supabase.from("invoice_items").delete().eq("invoice_id", id);
        
        if (items.length > 0) {
          const invoiceItems = items.map((item, index) => ({
            invoice_id: id,
            item_name: item.item_name,
            hsn_code: item.hsn_code,
            metal_type: item.metal_type as "gold" | "silver" | "platinum" | "palladium" | undefined,
            making_charge_type: item.making_charge_type as "per_gram" | "percentage" | "flat" | undefined,
            display_order: index,
          }));
          
          const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(invoiceItems);
          
          if (itemsError) throw itemsError;
        }
      }
      
      return invoice;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
      toast.success("Invoice updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const { data, error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create journal entry when invoice is confirmed
      if (status === "confirmed" && currentBranch?.id && data.grand_total > 0) {
        await createInvoiceJournalEntry(
          currentBranch.id,
          data.id,
          data.invoice_number,
          data.invoice_date,
          data.grand_total,
          data.cgst_amount || 0,
          data.sgst_amount || 0,
          data.igst_amount || 0
        );
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["daybook-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-financial"] });
      toast.success("Invoice status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}
