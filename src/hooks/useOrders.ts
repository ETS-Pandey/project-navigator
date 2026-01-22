import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { RepairOrder, CustomOrder, RepairOrderFormData, CustomOrderFormData, OrderStatus } from "@/types/orders";

interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
}

// =============================================
// REPAIR ORDERS
// =============================================

export function useRepairOrders(filters?: OrderFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["repair-orders", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("repair_orders")
        .select(`
          *,
          customer:customers(id, name, phone)
        `)
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });
      
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters?.dateFrom) {
        query = query.gte("received_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("received_date", filters.dateTo);
      }
      
      if (filters?.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as RepairOrder[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useRepairOrder(orderId: string) {
  return useQuery({
    queryKey: ["repair-order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_orders")
        .select(`
          *,
          customer:customers(id, name, phone)
        `)
        .eq("id", orderId)
        .single();
      
      if (error) throw error;
      return data as RepairOrder;
    },
    enabled: !!orderId,
  });
}

export function useCreateRepairOrder() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: RepairOrderFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate order number
      const { data: lastOrder } = await supabase
        .from("repair_orders")
        .select("order_number")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      const lastNum = lastOrder?.order_number 
        ? parseInt(lastOrder.order_number.replace(/\D/g, "")) 
        : 0;
      const orderNumber = `REP${String(lastNum + 1).padStart(5, "0")}`;
      
      const insertData = {
        branch_id: currentBranch.id,
        order_number: orderNumber,
        customer_id: data.customer_id || null,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone || null,
        item_description: data.item_description,
        item_type: data.item_type || null,
        metal_type: data.metal_type || null,
        purity: data.purity || null,
        weight_received: data.weight_received || null,
        issue_description: data.issue_description || null,
        estimated_cost: data.estimated_cost || null,
        advance_paid: data.advance_paid || 0,
        balance_due: (data.estimated_cost || 0) - (data.advance_paid || 0),
        expected_date: data.expected_date || null,
        assigned_to: data.assigned_to || null,
        notes: data.notes || null,
      };
      
      const { data: result, error } = await supabase
        .from("repair_orders")
        .insert(insertData as never)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-orders"] });
      toast.success("Repair order created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create repair order: ${error.message}`);
    },
  });
}

export function useUpdateRepairOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status, finalCost, weightReturned }: { 
      orderId: string; 
      status: OrderStatus; 
      finalCost?: number;
      weightReturned?: number;
    }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === "ready" || status === "delivered") {
        updates.completed_date = new Date().toISOString().split("T")[0];
      }
      if (status === "delivered") {
        updates.delivered_date = new Date().toISOString().split("T")[0];
      }
      if (finalCost !== undefined) {
        updates.final_cost = finalCost;
      }
      if (weightReturned !== undefined) {
        updates.weight_returned = weightReturned;
      }
      
      const { error } = await supabase
        .from("repair_orders")
        .update(updates)
        .eq("id", orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repair-orders"] });
      queryClient.invalidateQueries({ queryKey: ["repair-order"] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

// =============================================
// CUSTOM ORDERS
// =============================================

export function useCustomOrders(filters?: OrderFilters) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["custom-orders", currentBranch?.id, filters],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("custom_orders")
        .select(`
          *,
          customer:customers(id, name, phone)
        `)
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });
      
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters?.dateFrom) {
        query = query.gte("order_date", filters.dateFrom);
      }
      
      if (filters?.dateTo) {
        query = query.lte("order_date", filters.dateTo);
      }
      
      if (filters?.customerId) {
        query = query.eq("customer_id", filters.customerId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CustomOrder[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCustomOrder(orderId: string) {
  return useQuery({
    queryKey: ["custom-order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_orders")
        .select(`
          *,
          customer:customers(id, name, phone)
        `)
        .eq("id", orderId)
        .single();
      
      if (error) throw error;
      return data as CustomOrder;
    },
    enabled: !!orderId,
  });
}

export function useCreateCustomOrder() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: CustomOrderFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Generate order number
      const { data: lastOrder } = await supabase
        .from("custom_orders")
        .select("order_number")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      const lastNum = lastOrder?.order_number 
        ? parseInt(lastOrder.order_number.replace(/\D/g, "")) 
        : 0;
      const orderNumber = `CUS${String(lastNum + 1).padStart(5, "0")}`;
      
      const insertData = {
        branch_id: currentBranch.id,
        order_number: orderNumber,
        customer_id: data.customer_id || null,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone || null,
        design_description: data.design_description,
        design_reference_url: data.design_reference_url || null,
        metal_type: data.metal_type || null,
        purity: data.purity || null,
        estimated_weight: data.estimated_weight || null,
        estimated_cost: data.estimated_cost || null,
        advance_paid: data.advance_paid || 0,
        balance_due: (data.estimated_cost || 0) - (data.advance_paid || 0),
        expected_date: data.expected_date || null,
        assigned_karigar: data.assigned_karigar || null,
        notes: data.notes || null,
      };
      
      const { data: result, error } = await supabase
        .from("custom_orders")
        .insert(insertData as never)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-orders"] });
      toast.success("Custom order created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create custom order: ${error.message}`);
    },
  });
}

export function useUpdateCustomOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status, finalCost, actualWeight }: { 
      orderId: string; 
      status: OrderStatus;
      finalCost?: number;
      actualWeight?: number;
    }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === "ready" || status === "delivered") {
        updates.completed_date = new Date().toISOString().split("T")[0];
      }
      if (status === "delivered") {
        updates.delivered_date = new Date().toISOString().split("T")[0];
      }
      if (finalCost !== undefined) {
        updates.final_cost = finalCost;
      }
      if (actualWeight !== undefined) {
        updates.actual_weight = actualWeight;
      }
      
      const { error } = await supabase
        .from("custom_orders")
        .update(updates)
        .eq("id", orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-orders"] });
      queryClient.invalidateQueries({ queryKey: ["custom-order"] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}
