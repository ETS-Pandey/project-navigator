import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice, Payment } from "@/types/billing";

export function useCustomerInvoices(customerId: string) {
  return useQuery({
    queryKey: ["customer-invoices", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", customerId)
        .order("invoice_date", { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!customerId,
  });
}

export function useCustomerPayments(customerId: string) {
  return useQuery({
    queryKey: ["customer-payments", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", customerId)
        .order("payment_date", { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!customerId,
  });
}

export function useCustomerOldGold(customerId: string) {
  return useQuery({
    queryKey: ["customer-old-gold", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("old_gold_purchases")
        .select("*")
        .eq("customer_id", customerId)
        .order("purchase_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
}
