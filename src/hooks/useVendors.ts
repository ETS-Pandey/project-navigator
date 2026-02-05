import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { Vendor, VendorFormData } from "@/types/purchase";

export function useVendors() {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["vendors", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as unknown as Vendor[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .single();
      
      if (error) throw error;
      return data as unknown as Vendor;
    },
    enabled: !!vendorId,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: VendorFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate vendor code
      const { data: lastVendor } = await supabase
        .from("vendors")
        .select("vendor_code")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      const lastNum = lastVendor?.vendor_code
        ? parseInt(lastVendor.vendor_code.replace(/\D/g, ""))
        : 0;
      const vendorCode = `V${String(lastNum + 1).padStart(4, "0")}`;
      
      const { data: result, error } = await supabase
        .from("vendors")
        .insert({
          branch_id: currentBranch.id,
          vendor_code: vendorCode,
          name: data.name,
          company_name: data.company_name,
          vendor_type: data.vendor_type,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          gstin: data.gstin,
          pan: data.pan,
          bank_name: data.bank_name,
          bank_account_number: data.bank_account_number,
          bank_ifsc: data.bank_ifsc,
          credit_period_days: data.credit_period_days || 0,
          credit_limit: data.credit_limit || 0,
          notes: data.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create vendor: ${error.message}`);
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Vendor> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("vendors")
        .update({
          name: data.name,
          company_name: data.company_name,
          vendor_type: data.vendor_type,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          gstin: data.gstin,
          pan: data.pan,
          bank_name: data.bank_name,
          bank_account_number: data.bank_account_number,
          bank_ifsc: data.bank_ifsc,
          credit_period_days: data.credit_period_days,
          credit_limit: data.credit_limit,
          notes: data.notes,
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update vendor: ${error.message}`);
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from("vendors")
        .update({ is_active: false })
        .eq("id", vendorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete vendor: ${error.message}`);
    },
  });
}

export function useVendorStats() {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["vendor-stats", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return null;
      
      const { data, error } = await supabase
        .from("vendors")
        .select("current_balance, vendor_type")
        .eq("branch_id", currentBranch.id)
        .eq("is_active", true);
      
      if (error) throw error;
      
      const totalOutstanding = data.reduce((sum, v) => sum + Number(v.current_balance), 0);
      const byType: Record<string, number> = {};
      data.forEach((v) => {
        byType[v.vendor_type] = (byType[v.vendor_type] || 0) + 1;
      });
      
      return {
        totalVendors: data.length,
        totalOutstanding,
        byType,
      };
    },
    enabled: !!currentBranch?.id,
  });
}
