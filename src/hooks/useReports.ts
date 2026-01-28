import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { format, startOfMonth, endOfMonth, subMonths, parseISO, isAfter } from "date-fns";

export interface SystemStats {
  // Sales
  totalSales: number;
  salesCount: number;
  totalGstCollected: number;
  avgInvoiceValue: number;
  paidAmount: number;
  pendingAmount: number;
  
  // Payments (Collections)
  totalPayments: number;
  paymentsCount: number;
  cashPayments: number;
  cardPayments: number;
  upiPayments: number;
  bankTransferPayments: number;
  
  // Inventory
  totalProducts: number;
  availableProducts: number;
  soldProducts: number;
  totalStockValue: number;
  totalGoldWeight: number;
  totalSilverWeight: number;
  
  // Customers
  totalCustomers: number;
  activeCustomers: number;
  totalOutstandingReceivables: number;
  
  // Loans
  activeLoans: number;
  totalLoanAmount: number;
  totalCollateralValue: number;
  totalOutstandingLoans: number;
  overdueLoans: number;
  overdueAmount: number;
  
  // Schemes
  activeEnrollments: number;
  totalSchemeCollected: number;
  pendingDues: number;
  maturingThisMonth: number;
  
  // Expenses
  totalExpenses: number;
  expenseCount: number;
  
  // Orders
  pendingRepairs: number;
  pendingCustomOrders: number;
  totalRepairRevenue: number;
  totalCustomOrderRevenue: number;
  
  // Old Gold
  oldGoldPurchases: number;
  oldGoldValue: number;
  oldGoldWeight: number;
}

export interface MonthlySalesData {
  month: string;
  sales: number;
  expenses: number;
  profit: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalPurchases: number;
  invoiceCount: number;
}

export interface CategorySales {
  category: string;
  amount: number;
  count: number;
}

export function useSystemStats(dateFrom?: string, dateTo?: string) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["system-stats", currentBranch?.id, dateFrom, dateTo],
    queryFn: async () => {
      if (!currentBranch?.id) return null;
      
      const branchId = currentBranch.id;
      const today = new Date();
      
      // Parallel fetch all data
      const [
        invoicesRes,
        productsRes,
        customersRes,
        loansRes,
        schemesRes,
        schemePaymentsRes,
        expensesRes,
        repairsRes,
        customOrdersRes,
        oldGoldRes,
        paymentsRes,
      ] = await Promise.all([
        // Invoices
        supabase
          .from("invoices")
          .select("*")
          .eq("branch_id", branchId)
          .eq("invoice_type", "sale"),
        
        // Products
        supabase
          .from("products")
          .select("status, total_cost, net_weight, metal_type")
          .eq("branch_id", branchId),
        
        // Customers
        supabase
          .from("customers")
          .select("id, is_active, outstanding_balance")
          .eq("branch_id", branchId),
        
        // Loans
        supabase
          .from("loans")
          .select("*")
          .eq("branch_id", branchId),
        
        // Scheme Enrollments
        supabase
          .from("scheme_enrollments")
          .select("status, total_paid, maturity_date")
          .eq("branch_id", branchId),
        
        // Scheme Payments
        supabase
          .from("scheme_payments")
          .select("status, amount_due")
          .eq("branch_id", branchId),
        
        // Expenses
        supabase
          .from("expenses")
          .select("amount")
          .eq("branch_id", branchId),
        
        // Repair Orders
        supabase
          .from("repair_orders")
          .select("status, final_cost")
          .eq("branch_id", branchId),
        
        // Custom Orders
        supabase
          .from("custom_orders")
          .select("status, final_cost")
          .eq("branch_id", branchId),
        
        // Old Gold Purchases
        supabase
          .from("old_gold_purchases")
          .select("net_value, net_weight")
          .eq("branch_id", branchId),
        
        // Payments
        supabase
          .from("payments")
          .select("amount, payment_mode")
          .eq("branch_id", branchId),
      ]);
      
      const invoices = invoicesRes.data || [];
      const products = productsRes.data || [];
      const customers = customersRes.data || [];
      const loans = loansRes.data || [];
      const schemes = schemesRes.data || [];
      const schemePayments = schemePaymentsRes.data || [];
      const expenses = expensesRes.data || [];
      const repairs = repairsRes.data || [];
      const customOrders = customOrdersRes.data || [];
      const oldGold = oldGoldRes.data || [];
      const payments = paymentsRes.data || [];
      
      // Calculate payment stats
      const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const cashPayments = payments
        .filter(p => p.payment_mode === "cash")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const cardPayments = payments
        .filter(p => p.payment_mode === "card")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const upiPayments = payments
        .filter(p => p.payment_mode === "upi")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const bankTransferPayments = payments
        .filter(p => p.payment_mode === "bank_transfer")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      // Calculate invoice stats
      const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);
      const totalGstCollected = invoices.reduce((sum, inv) => sum + Number(inv.total_gst || 0), 0);
      const paidAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0);
      const pendingAmount = invoices.reduce((sum, inv) => sum + Number(inv.balance_due || 0), 0);
      
      // Product stats
      const availableProducts = products.filter(p => p.status === "in_stock").length;
      const soldProducts = products.filter(p => p.status === "sold").length;
      const totalStockValue = products
        .filter(p => p.status === "in_stock")
        .reduce((sum, p) => sum + Number(p.total_cost || 0), 0);
      const totalGoldWeight = products
        .filter(p => p.status === "in_stock" && p.metal_type === "gold")
        .reduce((sum, p) => sum + Number(p.net_weight || 0), 0);
      const totalSilverWeight = products
        .filter(p => p.status === "in_stock" && p.metal_type === "silver")
        .reduce((sum, p) => sum + Number(p.net_weight || 0), 0);
      
      // Customer stats
      const activeCustomers = customers.filter(c => c.is_active).length;
      const totalOutstandingReceivables = customers.reduce((sum, c) => sum + Number(c.outstanding_balance || 0), 0);
      
      // Loan stats
      const activeLoans = loans.filter(l => l.status === "active");
      const totalLoanAmount = activeLoans.reduce((sum, l) => sum + Number(l.loan_amount || 0), 0);
      const totalCollateralValue = activeLoans.reduce((sum, l) => sum + Number(l.collateral_value || 0), 0);
      const totalOutstandingLoans = activeLoans.reduce((sum, l) => sum + Number(l.outstanding_total || 0), 0);
      const overdueLoans = activeLoans.filter(l => isAfter(today, parseISO(l.due_date)));
      const overdueAmount = overdueLoans.reduce((sum, l) => sum + Number(l.outstanding_total || 0), 0);
      
      // Scheme stats
      const activeEnrollments = schemes.filter(s => s.status === "active").length;
      const totalSchemeCollected = schemes.reduce((sum, s) => sum + Number(s.total_paid || 0), 0);
      const pendingDues = schemePayments
        .filter(p => p.status === "pending" || p.status === "overdue")
        .reduce((sum, p) => sum + Number(p.amount_due || 0), 0);
      const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(today), "yyyy-MM-dd");
      const maturingThisMonth = schemes.filter(s => 
        s.status === "active" && 
        s.maturity_date >= monthStart && 
        s.maturity_date <= monthEnd
      ).length;
      
      // Expense stats
      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      
      // Order stats
      const pendingRepairs = repairs.filter(r => 
        r.status === "pending" || r.status === "in_progress"
      ).length;
      const pendingCustomOrders = customOrders.filter(o => 
        o.status === "pending" || o.status === "in_progress"
      ).length;
      const totalRepairRevenue = repairs
        .filter(r => r.status === "delivered")
        .reduce((sum, r) => sum + Number(r.final_cost || 0), 0);
      const totalCustomOrderRevenue = customOrders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.final_cost || 0), 0);
      
      // Old gold stats
      const oldGoldValue = oldGold.reduce((sum, og) => sum + Number(og.net_value || 0), 0);
      const oldGoldWeight = oldGold.reduce((sum, og) => sum + Number(og.net_weight || 0), 0);
      
      return {
        totalSales,
        salesCount: invoices.length,
        totalGstCollected,
        avgInvoiceValue: invoices.length > 0 ? totalSales / invoices.length : 0,
        paidAmount,
        pendingAmount,
        
        // Payment stats
        totalPayments,
        paymentsCount: payments.length,
        cashPayments,
        cardPayments,
        upiPayments,
        bankTransferPayments,
        
        totalProducts: products.length,
        availableProducts,
        soldProducts,
        totalStockValue,
        totalGoldWeight,
        totalSilverWeight,
        
        totalCustomers: customers.length,
        activeCustomers,
        totalOutstandingReceivables,
        
        activeLoans: activeLoans.length,
        totalLoanAmount,
        totalCollateralValue,
        totalOutstandingLoans,
        overdueLoans: overdueLoans.length,
        overdueAmount,
        
        activeEnrollments,
        totalSchemeCollected,
        pendingDues,
        maturingThisMonth,
        
        totalExpenses,
        expenseCount: expenses.length,
        
        pendingRepairs,
        pendingCustomOrders,
        totalRepairRevenue,
        totalCustomOrderRevenue,
        
        oldGoldPurchases: oldGold.length,
        oldGoldValue,
        oldGoldWeight,
      } as SystemStats;
    },
    enabled: !!currentBranch?.id,
  });
}

export function useMonthlySalesData() {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["monthly-sales-data", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      const branchId = currentBranch.id;
      const monthsData: MonthlySalesData[] = [];
      
      // Get last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = format(startOfMonth(date), "yyyy-MM-dd");
        const monthEnd = format(endOfMonth(date), "yyyy-MM-dd");
        const monthLabel = format(date, "MMM yyyy");
        
        const [salesRes, expensesRes] = await Promise.all([
          supabase
            .from("invoices")
            .select("grand_total")
            .eq("branch_id", branchId)
            .eq("invoice_type", "sale")
            .gte("invoice_date", monthStart)
            .lte("invoice_date", monthEnd),
          
          supabase
            .from("expenses")
            .select("amount")
            .eq("branch_id", branchId)
            .gte("expense_date", monthStart)
            .lte("expense_date", monthEnd),
        ]);
        
        const sales = (salesRes.data || []).reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);
        const expenses = (expensesRes.data || []).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
        
        monthsData.push({
          month: monthLabel,
          sales,
          expenses,
          profit: sales - expenses,
        });
      }
      
      return monthsData;
    },
    enabled: !!currentBranch?.id,
  });
}

export function useTopCustomers(limit = 5) {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["top-customers", currentBranch?.id, limit],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      const { data: invoices } = await supabase
        .from("invoices")
        .select("customer_id, customer_name, grand_total")
        .eq("branch_id", currentBranch.id)
        .eq("invoice_type", "sale")
        .not("customer_id", "is", null);
      
      if (!invoices) return [];
      
      // Aggregate by customer
      const customerMap = new Map<string, { name: string; total: number; count: number }>();
      
      for (const inv of invoices) {
        if (!inv.customer_id) continue;
        
        const existing = customerMap.get(inv.customer_id);
        if (existing) {
          existing.total += Number(inv.grand_total || 0);
          existing.count++;
        } else {
          customerMap.set(inv.customer_id, {
            name: inv.customer_name || "Unknown",
            total: Number(inv.grand_total || 0),
            count: 1,
          });
        }
      }
      
      // Convert to array and sort
      const customers: TopCustomer[] = Array.from(customerMap.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          totalPurchases: data.total,
          invoiceCount: data.count,
        }))
        .sort((a, b) => b.totalPurchases - a.totalPurchases)
        .slice(0, limit);
      
      return customers;
    },
    enabled: !!currentBranch?.id,
  });
}

export function useCategorySales() {
  const { currentBranch } = useBranch();
  
  return useQuery({
    queryKey: ["category-sales", currentBranch?.id],
    queryFn: async () => {
      if (!currentBranch?.id) return [];
      
      const { data: items } = await supabase
        .from("invoice_items")
        .select(`
          total_amount,
          metal_type,
          invoice:invoices!inner(branch_id, invoice_type)
        `)
        .eq("invoice.branch_id", currentBranch.id)
        .eq("invoice.invoice_type", "sale");
      
      if (!items) return [];
      
      // Aggregate by metal type
      const categoryMap = new Map<string, { amount: number; count: number }>();
      
      for (const item of items) {
        const category = item.metal_type || "Other";
        const existing = categoryMap.get(category);
        if (existing) {
          existing.amount += Number(item.total_amount || 0);
          existing.count++;
        } else {
          categoryMap.set(category, {
            amount: Number(item.total_amount || 0),
            count: 1,
          });
        }
      }
      
      const categories: CategorySales[] = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount);
      
      return categories;
    },
    enabled: !!currentBranch?.id,
  });
}
