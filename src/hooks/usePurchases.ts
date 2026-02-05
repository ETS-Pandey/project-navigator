import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { Purchase, VendorPayment, VendorPaymentFormData } from "@/types/purchase";

// =============================================
// PURCHASES
// =============================================

export function usePurchases(status?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["purchases", currentBranch?.id, status],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("purchases")
        .select(`
          *,
          vendor:vendors(id, name, company_name, vendor_code)
        `)
        .eq("branch_id", currentBranch.id)
        .order("purchase_date", { ascending: false });
      
      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Purchase[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function usePurchase(purchaseId: string) {
  return useQuery({
    queryKey: ["purchase", purchaseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          vendor:vendors(*),
          items:purchase_items(*)
        `)
        .eq("id", purchaseId)
        .single();
      
      if (error) throw error;
      return data as unknown as Purchase;
    },
    enabled: !!purchaseId,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: {
      vendor_id?: string;
      purchase_type: string;
      purchase_date: string;
      invoice_number?: string;
      invoice_date?: string;
      is_interstate?: boolean;
      notes?: string;
      items: {
        item_description: string;
        quantity: number;
        unit_price: number;
        hsn_code?: string;
        metal_type?: string;
        purity?: string;
        gross_weight?: number;
        net_weight?: number;
        rate_per_gram?: number;
        gst_percent?: number;
      }[];
    }) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate purchase number
      const { data: lastPurchase } = await supabase
        .from("purchases")
        .select("purchase_number")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      const lastNum = lastPurchase?.purchase_number
        ? parseInt(lastPurchase.purchase_number.replace(/\D/g, ""))
        : 0;
      const purchaseNumber = `PUR${String(lastNum + 1).padStart(5, "0")}`;
      
      // Calculate totals
      let grossAmount = 0;
      let totalGst = 0;
      
      const items = data.items.map((item, index) => {
        const lineTotal = item.quantity * item.unit_price;
        const gstAmount = item.gst_percent ? (lineTotal * item.gst_percent) / 100 : 0;
        grossAmount += lineTotal;
        totalGst += gstAmount;
        
        return {
          item_description: item.item_description,
          hsn_code: item.hsn_code,
          metal_type: item.metal_type,
          purity: item.purity,
          gross_weight: item.gross_weight,
          net_weight: item.net_weight,
          rate_per_gram: item.rate_per_gram,
          quantity: item.quantity,
          unit_price: item.unit_price,
          taxable_amount: lineTotal,
          gst_percent: item.gst_percent,
          gst_amount: gstAmount,
          total_amount: lineTotal + gstAmount,
          display_order: index,
        };
      });
      
      const grandTotal = grossAmount + totalGst;
      
      // Create purchase
      const { data: purchase, error } = await supabase
        .from("purchases")
        .insert({
          branch_id: currentBranch.id,
          purchase_number: purchaseNumber,
          vendor_id: data.vendor_id,
          purchase_type: data.purchase_type,
          purchase_date: data.purchase_date,
          invoice_number: data.invoice_number,
          invoice_date: data.invoice_date,
          is_interstate: data.is_interstate || false,
          gross_amount: grossAmount,
          taxable_amount: grossAmount,
          total_gst: totalGst,
          cgst_amount: data.is_interstate ? 0 : totalGst / 2,
          sgst_amount: data.is_interstate ? 0 : totalGst / 2,
          igst_amount: data.is_interstate ? totalGst : 0,
          grand_total: grandTotal,
          balance_due: grandTotal,
          status: "draft",
          notes: data.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create items
      const itemsWithPurchaseId = items.map((item) => ({
        ...item,
        purchase_id: purchase.id,
      }));
      
      const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(itemsWithPurchaseId);
      
      if (itemsError) throw itemsError;
      
      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Purchase created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create purchase: ${error.message}`);
    },
  });
}

export function useConfirmPurchase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (purchaseId: string) => {
      const { data, error } = await supabase
        .from("purchases")
        .update({ status: "confirmed" })
        .eq("id", purchaseId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Purchase confirmed");
    },
    onError: (error) => {
      toast.error(`Failed to confirm purchase: ${error.message}`);
    },
  });
}

// =============================================
// VENDOR PAYMENTS
// =============================================

export function useVendorPayments(vendorId?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["vendor-payments", currentBranch?.id, vendorId],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("vendor_payments")
        .select(`
          *,
          vendor:vendors(id, name, vendor_code),
          purchase:purchases(id, purchase_number)
        `)
        .eq("branch_id", currentBranch.id)
        .order("payment_date", { ascending: false });
      
      if (vendorId) {
        query = query.eq("vendor_id", vendorId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as VendorPayment[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreateVendorPayment() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: VendorPaymentFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate payment number
      const { data: lastPayment } = await supabase
        .from("vendor_payments")
        .select("payment_number")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      const lastNum = lastPayment?.payment_number
        ? parseInt(lastPayment.payment_number.replace(/\D/g, ""))
        : 0;
      const paymentNumber = `VPAY${String(lastNum + 1).padStart(5, "0")}`;
      
      const { data: result, error } = await supabase
        .from("vendor_payments")
        .insert({
          branch_id: currentBranch.id,
          payment_number: paymentNumber,
          vendor_id: data.vendor_id,
          purchase_id: data.purchase_id,
          payment_date: data.payment_date,
          amount: data.amount,
          payment_mode: data.payment_mode,
          reference_number: data.reference_number,
          bank_name: data.bank_name,
          cheque_number: data.cheque_number,
          cheque_date: data.cheque_date,
          deduction_amount: data.deduction_amount || 0,
          deduction_reason: data.deduction_reason,
          tds_amount: data.tds_amount || 0,
          notes: data.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });
}

// Stats
export function usePurchaseStats() {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["purchase-stats", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return null;
      
      const { data, error } = await supabase
        .from("purchases")
        .select("grand_total, balance_due, status, purchase_type")
        .eq("branch_id", currentBranch.id)
        .neq("status", "cancelled");
      
      if (error) throw error;
      
      const totalPurchases = data.reduce((sum, p) => sum + Number(p.grand_total), 0);
      const totalOutstanding = data.reduce((sum, p) => sum + Number(p.balance_due), 0);
      const byType: Record<string, number> = {};
      data.forEach((p) => {
        byType[p.purchase_type] = (byType[p.purchase_type] || 0) + Number(p.grand_total);
      });
      
      return {
        totalPurchases,
        totalOutstanding,
        count: data.length,
        byType,
      };
    },
    enabled: !!currentBranch?.id,
  });
}
