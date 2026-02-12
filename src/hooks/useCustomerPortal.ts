import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PortalCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  customer_code: string;
  loyalty_points: number | null;
  outstanding_balance: number | null;
}

export function useCustomerPortalAuth() {
  const [customer, setCustomer] = useState<PortalCustomer | null>(() => {
    const stored = localStorage.getItem("portal_customer");
    return stored ? JSON.parse(stored) : null;
  });
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem("portal_session");
  });
  const { toast } = useToast();

  const requestOtp = useCallback(async (phone: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-otp", {
        body: { phone, action: "request" },
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      throw err;
    }
  }, [toast]);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-otp", {
        body: { phone, otp, action: "verify" },
      });
      if (error) throw error;

      if (data.success && data.customer) {
        setCustomer(data.customer);
        setSessionToken(data.sessionToken);
        localStorage.setItem("portal_customer", JSON.stringify(data.customer));
        localStorage.setItem("portal_session", data.sessionToken);
      }
      return data;
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
      throw err;
    }
  }, [toast]);

  const logout = useCallback(() => {
    setCustomer(null);
    setSessionToken(null);
    localStorage.removeItem("portal_customer");
    localStorage.removeItem("portal_session");
  }, []);

  return { customer, sessionToken, requestOtp, verifyOtp, logout, isAuthenticated: !!customer };
}

export function useCustomerInvoices(customerId?: string) {
  return useQuery({
    queryKey: ["portal-invoices", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, grand_total, status, amount_paid, balance_due")
        .eq("customer_id", customerId)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });
}

export function useCustomerLoans(customerId?: string) {
  return useQuery({
    queryKey: ["portal-loans", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from("loans")
        .select("id, loan_number, loan_date, loan_amount, outstanding_total, status, due_date, interest_rate")
        .eq("customer_id", customerId)
        .order("loan_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });
}

export function useCustomerSchemeEnrollments(customerId?: string) {
  return useQuery({
    queryKey: ["portal-enrollments", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from("scheme_enrollments")
        .select(`
          id, enrollment_number, enrollment_date, monthly_amount, 
          total_paid, installments_paid, installments_remaining, status,
          scheme:savings_schemes(scheme_name, duration_months)
        `)
        .eq("customer_id", customerId)
        .order("enrollment_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });
}
