import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { Quotation, QuotationItem, QuotationStatus } from "@/types/billing";

interface QuotationFilters {
  status?: QuotationStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useQuotations(filters?: QuotationFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["quotations", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("quotations")
        .select(`
          *,
          customer:customers(*)
        `)
        .eq("branch_id", currentBranch.id)
        .order("quotation_date", { ascending: false });
      
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters?.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }
      
      if (filters?.dateFrom) {
        query = query.gte("quotation_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("quotation_date", filters.dateTo);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Quotation[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useQuotation(quotationId: string) {
  return useQuery({
    queryKey: ["quotation", quotationId],
    queryFn: async () => {
      const { data: quotation, error: quotationError } = await supabase
        .from("quotations")
        .select(`
          *,
          customer:customers(*)
        `)
        .eq("id", quotationId)
        .single();
      
      if (quotationError) throw quotationError;
      
      const { data: items, error: itemsError } = await supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", quotationId)
        .order("display_order");
      
      if (itemsError) throw itemsError;
      
      return {
        ...quotation,
        items,
      } as Quotation;
    },
    enabled: !!quotationId,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async ({
      quotationData,
      items,
    }: {
      quotationData: Partial<Quotation>;
      items: Partial<QuotationItem>[];
    }) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate quotation number
      const today = new Date();
      const prefix = `QT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
      
      const { count } = await supabase
        .from("quotations")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", currentBranch.id)
        .ilike("quotation_number", `${prefix}%`);
      
      const quotationNumber = `${prefix}-${String((count || 0) + 1).padStart(4, "0")}`;
      
      // Set valid until date (default 7 days)
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 7);
      
      const { data: quotation, error: quotationError } = await supabase
        .from("quotations")
        .insert({
          ...quotationData,
          branch_id: currentBranch.id,
          quotation_number: quotationNumber,
          valid_until: quotationData.valid_until || validUntil.toISOString().split("T")[0],
        })
        .select()
        .single();
      
      if (quotationError) throw quotationError;
      
      // Create quotation items
      if (items.length > 0) {
        const quotationItems = items.map((item, index) => ({
          quotation_id: quotation.id,
          item_name: item.item_name || "Item",
          hsn_code: item.hsn_code || "7113",
          metal_type: item.metal_type as "gold" | "silver" | "platinum" | "palladium" | undefined,
          purity: item.purity,
          gross_weight: item.gross_weight,
          net_weight: item.net_weight,
          rate_per_gram: item.rate_per_gram,
          metal_value: item.metal_value,
          making_charges: item.making_charges,
          stone_value: item.stone_value,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          discount_percent: item.discount_percent,
          discount_amount: item.discount_amount,
          total_amount: item.total_amount || 0,
          display_order: index,
        }));
        
        const { error: itemsError } = await supabase
          .from("quotation_items")
          .insert(quotationItems);
        
        if (itemsError) throw itemsError;
      }
      
      return quotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create quotation: ${error.message}`);
    },
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuotationStatus }) => {
      const { data, error } = await supabase
        .from("quotations")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
      toast.success("Quotation status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

export function useConvertQuotationToInvoice() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (quotationId: string) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Fetch quotation with items
      const { data: quotation, error: qError } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", quotationId)
        .single();
      
      if (qError) throw qError;
      
      const { data: items, error: iError } = await supabase
        .from("quotation_items")
        .select("*")
        .eq("quotation_id", quotationId);
      
      if (iError) throw iError;
      
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
      const { data: invoice, error: invError } = await supabase
        .from("invoices")
        .insert({
          branch_id: currentBranch.id,
          invoice_number: invoiceNumber,
          customer_id: quotation.customer_id,
          customer_name: quotation.customer_name,
          customer_phone: quotation.customer_phone,
          gross_amount: quotation.gross_amount,
          discount_amount: quotation.discount_amount,
          taxable_amount: quotation.taxable_amount,
          total_gst: quotation.total_gst,
          grand_total: quotation.grand_total,
          balance_due: quotation.grand_total,
          notes: quotation.notes,
          terms_conditions: quotation.terms_conditions,
        })
        .select()
        .single();
      
      if (invError) throw invError;
      
      // Create invoice items
      if (items && items.length > 0) {
        const invoiceItems = items.map((item) => ({
          invoice_id: invoice.id,
          product_id: item.product_id,
          item_code: item.item_code,
          item_name: item.item_name,
          hsn_code: item.hsn_code,
          description: item.description,
          metal_type: item.metal_type,
          purity: item.purity,
          gross_weight: item.gross_weight,
          net_weight: item.net_weight,
          rate_per_gram: item.rate_per_gram,
          metal_value: item.metal_value,
          making_charges: item.making_charges,
          stone_value: item.stone_value,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          discount_amount: item.discount_amount,
          taxable_amount: item.total_amount,
          total_amount: item.total_amount,
          display_order: item.display_order,
        }));
        
        await supabase.from("invoice_items").insert(invoiceItems);
      }
      
      // Update quotation status
      await supabase
        .from("quotations")
        .update({
          status: "converted",
          converted_invoice_id: invoice.id,
        })
        .eq("id", quotationId);
      
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Quotation converted to invoice");
    },
    onError: (error) => {
      toast.error(`Failed to convert: ${error.message}`);
    },
  });
}
