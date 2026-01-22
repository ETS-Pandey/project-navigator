import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useToast } from "@/hooks/use-toast";
import { addMonths, format, parseISO, startOfMonth, endOfMonth, isBefore } from "date-fns";
import type { 
  Scheme, 
  SchemeEnrollment, 
  SchemePayment, 
  SchemeFormData, 
  EnrollmentFormData,
  SchemePaymentFormData,
  SchemeStatistics 
} from "@/types/schemes";

// Fetch all schemes
export function useSchemes(status?: 'active' | 'inactive' | 'discontinued') {
  const { currentBranch } = useBranch();

  return useQuery({
    queryKey: ['schemes', currentBranch?.id, status],
    queryFn: async () => {
      let query = supabase
        .from('schemes')
        .select('*')
        .eq('branch_id', currentBranch!.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Scheme[];
    },
    enabled: !!currentBranch?.id,
  });
}

// Fetch single scheme
export function useScheme(schemeId: string | undefined) {
  return useQuery({
    queryKey: ['scheme', schemeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('id', schemeId!)
        .single();

      if (error) throw error;
      return data as Scheme;
    },
    enabled: !!schemeId,
  });
}

// Fetch enrollments
export function useSchemeEnrollments(filters?: { 
  status?: 'active' | 'completed' | 'cancelled' | 'defaulted' | 'matured'; 
  schemeId?: string; 
  customerId?: string;
  maturingThisMonth?: boolean;
}) {
  const { currentBranch } = useBranch();

  return useQuery({
    queryKey: ['scheme-enrollments', currentBranch?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('scheme_enrollments')
        .select(`
          *,
          customer:customers(id, name, phone, customer_code),
          scheme:schemes(id, scheme_code, scheme_name, duration_months, monthly_amount, bonus_type, bonus_value)
        `)
        .eq('branch_id', currentBranch!.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.schemeId) {
        query = query.eq('scheme_id', filters.schemeId);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.maturingThisMonth) {
        const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        query = query.gte('maturity_date', start).lte('maturity_date', end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SchemeEnrollment[];
    },
    enabled: !!currentBranch?.id,
  });
}

// Fetch single enrollment
export function useSchemeEnrollment(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['scheme-enrollment', enrollmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheme_enrollments')
        .select(`
          *,
          customer:customers(id, name, phone, customer_code),
          scheme:schemes(*)
        `)
        .eq('id', enrollmentId!)
        .single();

      if (error) throw error;
      return data as SchemeEnrollment;
    },
    enabled: !!enrollmentId,
  });
}

// Fetch enrollment payments
export function useSchemePayments(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['scheme-payments', enrollmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheme_payments')
        .select('*')
        .eq('enrollment_id', enrollmentId!)
        .order('installment_number', { ascending: true });

      if (error) throw error;
      return data as SchemePayment[];
    },
    enabled: !!enrollmentId,
  });
}

// Fetch pending payments (due this month or overdue)
export function usePendingSchemePayments() {
  const { currentBranch } = useBranch();
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['pending-scheme-payments', currentBranch?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheme_payments')
        .select(`
          *,
          enrollment:scheme_enrollments(
            id,
            enrollment_number,
            customer:customers(id, name, phone, customer_code),
            scheme:schemes(id, scheme_code, scheme_name)
          )
        `)
        .eq('branch_id', currentBranch!.id)
        .in('status', ['pending', 'overdue'])
        .lte('due_date', monthEnd)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!currentBranch?.id,
  });
}

// Statistics
export function useSchemeStatistics() {
  const { currentBranch } = useBranch();

  return useQuery({
    queryKey: ['scheme-statistics', currentBranch?.id],
    queryFn: async () => {
      const branchId = currentBranch!.id;
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      // Active enrollments
      const { count: activeEnrollments } = await supabase
        .from('scheme_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId)
        .eq('status', 'active');

      // Total collected
      const { data: collectedData } = await supabase
        .from('scheme_enrollments')
        .select('total_paid')
        .eq('branch_id', branchId);
      
      const totalCollected = collectedData?.reduce((sum, e) => sum + Number(e.total_paid), 0) || 0;

      // Pending dues
      const { data: duesData } = await supabase
        .from('scheme_payments')
        .select('amount_due')
        .eq('branch_id', branchId)
        .in('status', ['pending', 'overdue']);
      
      const pendingDues = duesData?.reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;

      // Maturing this month
      const { count: maturingCount } = await supabase
        .from('scheme_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId)
        .eq('status', 'active')
        .gte('maturity_date', monthStart)
        .lte('maturity_date', monthEnd);

      // Overdue payments
      const { count: overdueCount } = await supabase
        .from('scheme_payments')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId)
        .eq('status', 'overdue');

      return {
        totalActiveEnrollments: activeEnrollments || 0,
        totalCollected,
        pendingDues,
        maturing_this_month: maturingCount || 0,
        overdue_payments: overdueCount || 0,
      } as SchemeStatistics;
    },
    enabled: !!currentBranch?.id,
  });
}

// Create scheme
export function useCreateScheme() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SchemeFormData) => {
      const { data: scheme, error } = await supabase
        .from('schemes')
        .insert({
          branch_id: currentBranch!.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return scheme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      toast({ title: "Scheme created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create scheme", description: error.message, variant: "destructive" });
    },
  });
}

// Create enrollment
export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  const { currentBranch } = useBranch();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: EnrollmentFormData) => {
      // Get scheme details
      const { data: scheme, error: schemeError } = await supabase
        .from('schemes')
        .select('*')
        .eq('id', data.scheme_id)
        .single();

      if (schemeError) throw schemeError;

      // Generate enrollment number
      const { count } = await supabase
        .from('scheme_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', currentBranch!.id);

      const enrollmentNumber = `SE${currentBranch!.code}${String((count || 0) + 1).padStart(5, '0')}`;
      
      const startDate = parseISO(data.start_date);
      const maturityDate = addMonths(startDate, scheme.duration_months);
      
      // Calculate bonus
      let bonusAmount = 0;
      if (scheme.bonus_type === 'fixed') {
        bonusAmount = scheme.bonus_value;
      } else if (scheme.bonus_type === 'percentage') {
        bonusAmount = (scheme.monthly_amount * scheme.duration_months * scheme.bonus_value) / 100;
      }

      // Create enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('scheme_enrollments')
        .insert({
          branch_id: currentBranch!.id,
          scheme_id: data.scheme_id,
          customer_id: data.customer_id,
          enrollment_number: enrollmentNumber,
          enrollment_date: format(new Date(), 'yyyy-MM-dd'),
          start_date: data.start_date,
          maturity_date: format(maturityDate, 'yyyy-MM-dd'),
          monthly_amount: scheme.monthly_amount,
          total_due: scheme.monthly_amount * scheme.duration_months,
          installments_remaining: scheme.duration_months,
          bonus_amount: bonusAmount,
          notes: data.notes,
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Create payment schedule
      const payments = [];
      for (let i = 1; i <= scheme.duration_months; i++) {
        const dueDate = addMonths(startDate, i - 1);
        const paymentNumber = `${enrollmentNumber}-${String(i).padStart(2, '0')}`;
        
        payments.push({
          branch_id: currentBranch!.id,
          enrollment_id: enrollment.id,
          payment_number: paymentNumber,
          installment_number: i,
          due_date: format(dueDate, 'yyyy-MM-dd'),
          amount_due: scheme.monthly_amount,
          status: 'pending' as const,
        });
      }

      const { error: paymentsError } = await supabase
        .from('scheme_payments')
        .insert(payments);

      if (paymentsError) throw paymentsError;

      return enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheme-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-statistics'] });
      toast({ title: "Customer enrolled successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to enroll customer", description: error.message, variant: "destructive" });
    },
  });
}

// Record payment
export function useRecordSchemePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      paymentId, 
      enrollmentId,
      data 
    }: { 
      paymentId: string; 
      enrollmentId: string;
      data: SchemePaymentFormData;
    }) => {
      // Update payment record
      const { error: paymentError } = await supabase
        .from('scheme_payments')
        .update({
          amount_paid: data.amount,
          payment_date: format(new Date(), 'yyyy-MM-dd'),
          payment_mode: data.payment_mode,
          reference_number: data.reference_number,
          bank_name: data.bank_name,
          cheque_number: data.cheque_number,
          cheque_date: data.cheque_date,
          upi_id: data.upi_id,
          notes: data.notes,
          status: 'paid',
        })
        .eq('id', paymentId);

      if (paymentError) throw paymentError;

      // Get enrollment to update totals
      const { data: enrollment } = await supabase
        .from('scheme_enrollments')
        .select('*, scheme:schemes(*)')
        .eq('id', enrollmentId)
        .single();

      if (!enrollment) throw new Error('Enrollment not found');

      const newTotalPaid = Number(enrollment.total_paid) + data.amount;
      const newInstallmentsPaid = enrollment.installments_paid + 1;
      const newInstallmentsRemaining = enrollment.installments_remaining - 1;

      // Check if matured
      const isMatured = newInstallmentsRemaining === 0;

      // Update enrollment
      const { error: enrollmentError } = await supabase
        .from('scheme_enrollments')
        .update({
          total_paid: newTotalPaid,
          installments_paid: newInstallmentsPaid,
          installments_remaining: newInstallmentsRemaining,
          bonus_earned: isMatured,
          status: isMatured ? 'matured' : 'active',
          matured_at: isMatured ? new Date().toISOString() : null,
          payout_amount: isMatured ? newTotalPaid + Number(enrollment.bonus_amount) : 0,
        })
        .eq('id', enrollmentId);

      if (enrollmentError) throw enrollmentError;

      return { isMatured };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['scheme-payments'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-enrollment'] });
      queryClient.invalidateQueries({ queryKey: ['pending-scheme-payments'] });
      queryClient.invalidateQueries({ queryKey: ['scheme-statistics'] });
      
      if (result.isMatured) {
        toast({ title: "Payment recorded - Scheme matured!", description: "Customer can now redeem the benefits." });
      } else {
        toast({ title: "Payment recorded successfully" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Failed to record payment", description: error.message, variant: "destructive" });
    },
  });
}

// Update scheme
export function useUpdateScheme() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SchemeFormData> }) => {
      const { error } = await supabase
        .from('schemes')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      queryClient.invalidateQueries({ queryKey: ['scheme'] });
      toast({ title: "Scheme updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update scheme", description: error.message, variant: "destructive" });
    },
  });
}
