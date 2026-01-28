import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, subMonths, format } from "date-fns";

export function useDashboardStats() {
  const { currentBranch } = useBranch();
  const branchId = currentBranch?.id;

  const today = new Date();
  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }).toISOString();
  const monthStart = startOfMonth(today).toISOString();
  const lastMonthStart = startOfMonth(subMonths(today, 1)).toISOString();
  const lastMonthEnd = endOfDay(subMonths(startOfMonth(today), 1)).toISOString();

  // Sales statistics
  const salesQuery = useQuery({
    queryKey: ["dashboard-sales", branchId],
    queryFn: async () => {
      if (!branchId) return null;

      // Today's sales
      const { data: todaySales, error: todayError } = await supabase
        .from("invoices")
        .select("grand_total, id")
        .eq("branch_id", branchId)
        .gte("invoice_date", todayStart.split('T')[0])
        .lte("invoice_date", todayEnd.split('T')[0])
        .in("status", ["paid", "partially_paid"]);

      if (todayError) throw todayError;

      // This week's sales
      const { data: weekSales, error: weekError } = await supabase
        .from("invoices")
        .select("grand_total")
        .eq("branch_id", branchId)
        .gte("invoice_date", weekStart.split('T')[0])
        .in("status", ["paid", "partially_paid"]);

      if (weekError) throw weekError;

      // This month's sales
      const { data: monthSales, error: monthError } = await supabase
        .from("invoices")
        .select("grand_total")
        .eq("branch_id", branchId)
        .gte("invoice_date", monthStart.split('T')[0])
        .in("status", ["paid", "partially_paid"]);

      if (monthError) throw monthError;

      // Last month's sales for comparison
      const { data: lastMonthSales, error: lastMonthError } = await supabase
        .from("invoices")
        .select("grand_total")
        .eq("branch_id", branchId)
        .gte("invoice_date", lastMonthStart.split('T')[0])
        .lt("invoice_date", monthStart.split('T')[0])
        .in("status", ["paid", "partially_paid"]);

      if (lastMonthError) throw lastMonthError;

      const todayTotal = todaySales?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0;
      const weekTotal = weekSales?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0;
      const monthTotal = monthSales?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0;
      const lastMonthTotal = lastMonthSales?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0;

      const monthComparison = lastMonthTotal > 0 
        ? ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100 
        : monthTotal > 0 ? 100 : 0;

      return {
        today: todayTotal,
        todayCount: todaySales?.length || 0,
        week: weekTotal,
        month: monthTotal,
        monthComparison: Math.round(monthComparison * 10) / 10,
      };
    },
    enabled: !!branchId,
  });

  // Financial statistics
  const financialQuery = useQuery({
    queryKey: ["dashboard-financial", branchId],
    queryFn: async () => {
      if (!branchId) return null;

      // Get cash and bank accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("chart_of_accounts")
        .select("account_code, account_name, current_balance")
        .eq("is_active", true);

      if (accountsError) throw accountsError;

      // Find cash and bank accounts by code patterns
      const cashAccount = accounts?.find(a => a.account_code === "1001" || a.account_name.toLowerCase().includes("cash"));
      const bankAccounts = accounts?.filter(a => 
        a.account_code.startsWith("1002") || 
        a.account_name.toLowerCase().includes("bank")
      );

      const cashBalance = cashAccount?.current_balance || 0;
      const bankBalance = bankAccounts?.reduce((sum, acc) => sum + (acc.current_balance || 0), 0) || 0;

      // Get receivables from invoices
      const { data: receivables, error: recError } = await supabase
        .from("invoices")
        .select("balance_due")
        .eq("branch_id", branchId)
        .gt("balance_due", 0);

      if (recError) throw recError;

      const totalReceivables = receivables?.reduce((sum, inv) => sum + (inv.balance_due || 0), 0) || 0;

      // Get payables from expenses (pending status)
      const { data: payables, error: payError } = await supabase
        .from("expenses")
        .select("amount")
        .eq("branch_id", branchId)
        .eq("status", "pending");

      if (payError) throw payError;

      const totalPayables = payables?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

      // Get today's expenses
      const { data: todayExpenses, error: todayExpError } = await supabase
        .from("expenses")
        .select("amount")
        .eq("branch_id", branchId)
        .gte("expense_date", todayStart.split('T')[0])
        .lte("expense_date", todayEnd.split('T')[0]);

      if (todayExpError) throw todayExpError;

      const todayExpenseTotal = todayExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

      // Get this month's expenses
      const { data: monthExpenses, error: monthExpError } = await supabase
        .from("expenses")
        .select("amount")
        .eq("branch_id", branchId)
        .gte("expense_date", monthStart.split('T')[0]);

      if (monthExpError) throw monthExpError;

      const monthExpenseTotal = monthExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

      // Get today's payments (collections)
      const { data: todayPayments, error: todayPayError } = await supabase
        .from("payments")
        .select("amount")
        .eq("branch_id", branchId)
        .gte("payment_date", todayStart.split('T')[0])
        .lte("payment_date", todayEnd.split('T')[0]);

      if (todayPayError) throw todayPayError;

      const todayPaymentTotal = todayPayments?.reduce((sum, pay) => sum + (pay.amount || 0), 0) || 0;

      // Get this month's payments
      const { data: monthPayments, error: monthPayError } = await supabase
        .from("payments")
        .select("amount")
        .eq("branch_id", branchId)
        .gte("payment_date", monthStart.split('T')[0]);

      if (monthPayError) throw monthPayError;

      const monthPaymentTotal = monthPayments?.reduce((sum, pay) => sum + (pay.amount || 0), 0) || 0;

      return {
        cashBalance,
        bankBalance,
        receivables: totalReceivables,
        payables: totalPayables,
        todayExpenses: todayExpenseTotal,
        todayExpenseCount: todayExpenses?.length || 0,
        monthExpenses: monthExpenseTotal,
        monthExpenseCount: monthExpenses?.length || 0,
        todayPayments: todayPaymentTotal,
        todayPaymentCount: todayPayments?.length || 0,
        monthPayments: monthPaymentTotal,
        monthPaymentCount: monthPayments?.length || 0,
      };
    },
    enabled: !!branchId,
  });

  // Alerts
  const alertsQuery = useQuery({
    queryKey: ["dashboard-alerts", branchId],
    queryFn: async () => {
      if (!branchId) return [];

      const alerts: { type: "warning" | "error" | "info"; message: string; link: string }[] = [];

      // Check for low stock items (products with status 'in_stock' but we'll need to add a threshold check)
      const { data: lowStockProducts, error: stockError } = await supabase
        .from("products")
        .select("id")
        .eq("branch_id", branchId)
        .eq("status", "in_stock");

      // For now, we'll just check if inventory is getting low (arbitrary threshold)
      if (!stockError && lowStockProducts && lowStockProducts.length < 10) {
        alerts.push({
          type: "warning",
          message: `Only ${lowStockProducts.length} items in stock`,
          link: "/inventory/products",
        });
      }

      // Check for overdue invoices
      const { data: overdueInvoices, error: overdueError } = await supabase
        .from("invoices")
        .select("id")
        .eq("branch_id", branchId)
        .gt("balance_due", 0)
        .lt("payment_due_date", format(today, "yyyy-MM-dd"));

      if (!overdueError && overdueInvoices && overdueInvoices.length > 0) {
        alerts.push({
          type: "error",
          message: `${overdueInvoices.length} customer payment(s) overdue`,
          link: "/billing/invoices",
        });
      }

      // Check for loans due today or overdue
      const { data: loansDue, error: loansError } = await supabase
        .from("loans")
        .select("id")
        .eq("branch_id", branchId)
        .eq("status", "active")
        .lte("due_date", format(today, "yyyy-MM-dd"));

      if (!loansError && loansDue && loansDue.length > 0) {
        alerts.push({
          type: "info",
          message: `${loansDue.length} loan(s) due for collection`,
          link: "/loans/collections",
        });
      }

      // Check for repairs ready for pickup
      const { data: repairsReady, error: repairsError } = await supabase
        .from("repair_orders")
        .select("id")
        .eq("branch_id", branchId)
        .eq("status", "ready");

      if (!repairsError && repairsReady && repairsReady.length > 0) {
        alerts.push({
          type: "warning",
          message: `${repairsReady.length} repair(s) ready for pickup`,
          link: "/orders/repairs",
        });
      }

      // Check for pending custom orders
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("custom_orders")
        .select("id")
        .eq("branch_id", branchId)
        .eq("status", "pending");

      if (!ordersError && pendingOrders && pendingOrders.length > 0) {
        alerts.push({
          type: "info",
          message: `${pendingOrders.length} custom order(s) pending`,
          link: "/orders/custom",
        });
      }

      // Check for scheme payments due today
      const { data: schemePaymentsDue, error: schemeError } = await supabase
        .from("scheme_enrollments")
        .select("id")
        .eq("status", "active");

      if (!schemeError && schemePaymentsDue && schemePaymentsDue.length > 0) {
        alerts.push({
          type: "info",
          message: `${schemePaymentsDue.length} active scheme enrollment(s)`,
          link: "/schemes/enrollments",
        });
      }

      return alerts.slice(0, 5); // Limit to 5 alerts
    },
    enabled: !!branchId,
  });

  return {
    sales: salesQuery.data,
    financial: financialQuery.data,
    alerts: alertsQuery.data || [],
    isLoading: salesQuery.isLoading || financialQuery.isLoading || alertsQuery.isLoading,
    error: salesQuery.error || financialQuery.error || alertsQuery.error,
  };
}
