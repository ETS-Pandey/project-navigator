import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { Customer, CustomerFormData } from "@/types/billing";

interface CustomerFilters {
  search?: string;
  type?: string;
  isActive?: boolean;
}

export function useCustomers(filters?: CustomerFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["customers", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("customers")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("name");
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,customer_code.ilike.%${filters.search}%`);
      }
      
      if (filters?.type) {
        query = query.eq("customer_type", filters.type);
      }
      
      if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();
      
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate customer code
      const { count } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", currentBranch.id);
      
      const customerCode = `C${String((count || 0) + 1).padStart(5, "0")}`;
      
      const { data: customer, error } = await supabase
        .from("customers")
        .insert({
          ...data,
          branch_id: currentBranch.id,
          customer_code: customerCode,
        })
        .select()
        .single();
      
      if (error) throw error;
      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomerFormData> }) => {
      const { data: customer, error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return customer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
      toast.success("Customer updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });
}

export function useSearchCustomers() {
  const { currentBranch } = useBranch();
  
  return async (searchTerm: string) => {
    if (!currentBranch?.id || !searchTerm) return [];
    
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("branch_id", currentBranch.id)
      .eq("is_active", true)
      .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .limit(10);
    
    if (error) throw error;
    return data as Customer[];
  };
}
