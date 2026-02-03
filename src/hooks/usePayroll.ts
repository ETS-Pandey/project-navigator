import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import type { SalaryRecord, SalaryStructure, SalaryFormData } from "@/types/payroll";

// =============================================
// SALARY STRUCTURES
// =============================================

export function useSalaryStructures() {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["salary-structures", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      const { data, error } = await supabase
        .from("salary_structures")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .eq("is_active", true)
        .order("designation");
      
      if (error) throw error;
      return data as SalaryStructure[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: Partial<SalaryStructure>) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      const { data: result, error } = await supabase
        .from("salary_structures")
        .insert({
          branch_id: currentBranch.id,
          designation: data.designation,
          basic_salary: data.basic_salary || 0,
          hra_percent: data.hra_percent,
          da_percent: data.da_percent,
          other_allowances: data.other_allowances,
          pf_percent: data.pf_percent,
          esi_percent: data.esi_percent,
          professional_tax: data.professional_tax,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      toast.success("Salary structure created");
    },
    onError: (error) => {
      toast.error(`Failed to create salary structure: ${error.message}`);
    },
  });
}

// =============================================
// SALARY RECORDS
// =============================================

export function useSalaryRecords(month?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["salary-records", currentBranch?.id, month],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      let query = supabase
        .from("salary_records")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("salary_month", { ascending: false });
      
      if (month) {
        query = query.eq("salary_month", month);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SalaryRecord[];
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCreateSalaryRecord() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  
  return useMutation({
    mutationFn: async (data: SalaryFormData) => {
      if (!currentBranch?.id) throw new Error("No branch selected");
      
      // Calculate gross and net
      const earnings = [
        data.basic_salary,
        data.hra || 0,
        data.da || 0,
        data.other_allowances || 0,
        data.overtime_amount || 0,
        data.bonus || 0,
        data.commission || 0,
      ];
      
      const deductions = [
        data.pf_deduction || 0,
        data.esi_deduction || 0,
        data.professional_tax || 0,
        data.tds || 0,
        data.loan_deduction || 0,
        data.other_deductions || 0,
      ];
      
      const grossSalary = earnings.reduce((sum, val) => sum + val, 0);
      const totalDeductions = deductions.reduce((sum, val) => sum + val, 0);
      const netSalary = grossSalary - totalDeductions;
      
      // Pro-rata calculation
      const proRataFactor = data.days_worked / data.days_in_month;
      const adjustedNet = netSalary * proRataFactor;
      
      const { data: result, error } = await supabase
        .from("salary_records")
        .insert({
          branch_id: currentBranch.id,
          staff_id: data.staff_id,
          salary_month: data.salary_month,
          days_worked: data.days_worked,
          days_in_month: data.days_in_month,
          basic_salary: data.basic_salary,
          hra: data.hra,
          da: data.da,
          other_allowances: data.other_allowances,
          overtime_hours: data.overtime_hours,
          overtime_amount: data.overtime_amount,
          bonus: data.bonus,
          commission: data.commission,
          gross_salary: grossSalary,
          pf_deduction: data.pf_deduction,
          esi_deduction: data.esi_deduction,
          professional_tax: data.professional_tax,
          tds: data.tds,
          loan_deduction: data.loan_deduction,
          other_deductions: data.other_deductions,
          total_deductions: totalDeductions,
          net_salary: adjustedNet,
          notes: data.notes,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-records"] });
      toast.success("Salary record created");
    },
    onError: (error) => {
      toast.error(`Failed to create salary record: ${error.message}`);
    },
  });
}

export function useProcessSalary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      salaryId, 
      paymentMode, 
      paymentReference 
    }: { 
      salaryId: string; 
      paymentMode: string; 
      paymentReference?: string;
    }) => {
      const { data, error } = await supabase
        .from("salary_records")
        .update({
          status: "paid",
          payment_mode: paymentMode,
          payment_date: new Date().toISOString().split("T")[0],
          payment_reference: paymentReference,
        })
        .eq("id", salaryId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-records"] });
      toast.success("Salary marked as paid");
    },
    onError: (error) => {
      toast.error(`Failed to process salary: ${error.message}`);
    },
  });
}

// Stats
export function useSalaryStats(month?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["salary-stats", currentBranch?.id, month],
    queryFn: async () => {
      if (!currentBranch?.id) return null;
      
      let query = supabase
        .from("salary_records")
        .select("net_salary, status")
        .eq("branch_id", currentBranch.id);
      
      if (month) {
        query = query.eq("salary_month", month);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const totalPayroll = data.reduce((sum, r) => sum + Number(r.net_salary), 0);
      const paidAmount = data
        .filter(r => r.status === "paid")
        .reduce((sum, r) => sum + Number(r.net_salary), 0);
      const pendingAmount = totalPayroll - paidAmount;
      
      return {
        totalPayroll,
        paidAmount,
        pendingAmount,
        totalRecords: data.length,
        paidCount: data.filter(r => r.status === "paid").length,
        pendingCount: data.filter(r => r.status === "pending").length,
      };
    },
    enabled: !!currentBranch?.id,
  });
}
