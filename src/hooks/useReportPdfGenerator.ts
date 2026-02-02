import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useBusinessSettings } from "@/hooks/useSettings";
import jsPDF from "jspdf";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

export type ReportType = 
  | "gst_summary" 
  | "loan_report"
  | "income_expense" 
  | "sales_register"
  | "customer_ledger"
  | "stock_summary";

interface ReportOptions {
  reportType: ReportType;
  dateFrom?: string;
  dateTo?: string;
}

export function useReportPdfGenerator() {
  const { currentBranch } = useBranch();
  const { data: businessSettingsData } = useBusinessSettings("business_info");
  const businessSettings = businessSettingsData?.setting_value as Record<string, string> | undefined;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const addHeader = (doc: jsPDF, title: string, dateFrom?: string, dateTo?: string) => {
    const businessName = businessSettings?.business_name || "JewelPro";
    const businessAddress = businessSettings?.address || "";
    const gstin = businessSettings?.gstin || "";
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(businessName, 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (businessAddress) {
      doc.text(businessAddress, 105, 28, { align: "center" });
    }
    if (gstin) {
      doc.text(`GSTIN: ${gstin}`, 105, 35, { align: "center" });
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 105, 45, { align: "center" });
    
    if (dateFrom && dateTo) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Period: ${format(new Date(dateFrom), "dd/MM/yyyy")} to ${format(new Date(dateTo), "dd/MM/yyyy")}`, 105, 52, { align: "center" });
    }
    
    doc.setDrawColor(0);
    doc.line(14, 55, 196, 55);
    
    return 60;
  };

  const addFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${pageNum} of ${totalPages}`, 105, pageHeight - 10, { align: "center" });
    doc.text(`Generated on ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, pageHeight - 10);
  };

  const generateGstSummary = async (doc: jsPDF, dateFrom: string, dateTo: string) => {
    if (!currentBranch?.id) return;

    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("branch_id", currentBranch.id)
      .eq("invoice_type", "sale")
      .gte("invoice_date", dateFrom)
      .lte("invoice_date", dateTo)
      .order("invoice_date");

    let y = addHeader(doc, "GST Summary Report", dateFrom, dateTo);

    // Summary totals
    const totalSales = invoices?.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0) || 0;
    const totalCgst = invoices?.reduce((sum, inv) => sum + Number(inv.cgst_amount || 0), 0) || 0;
    const totalSgst = invoices?.reduce((sum, inv) => sum + Number(inv.sgst_amount || 0), 0) || 0;
    const totalIgst = invoices?.reduce((sum, inv) => sum + Number(inv.igst_amount || 0), 0) || 0;
    const totalTaxable = invoices?.reduce((sum, inv) => sum + Number(inv.taxable_amount || 0), 0) || 0;

    // Summary box
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y, 182, 35, "F");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Tax Summary", 20, y + 8);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Taxable Amount: ${formatCurrency(totalTaxable)}`, 20, y + 16);
    doc.text(`Total CGST: ${formatCurrency(totalCgst)}`, 20, y + 23);
    doc.text(`Total SGST: ${formatCurrency(totalSgst)}`, 100, y + 23);
    doc.text(`Total IGST: ${formatCurrency(totalIgst)}`, 20, y + 30);
    doc.text(`Total Sales: ${formatCurrency(totalSales)}`, 100, y + 30);
    
    y += 45;

    // Invoice table header
    doc.setFillColor(66, 66, 66);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y, 182, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice No", 16, y + 6);
    doc.text("Date", 45, y + 6);
    doc.text("Customer", 70, y + 6);
    doc.text("Taxable", 110, y + 6);
    doc.text("CGST", 135, y + 6);
    doc.text("SGST", 155, y + 6);
    doc.text("Total", 175, y + 6);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    invoices?.forEach((inv, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 4, 182, 7, "F");
      }
      
      doc.text(inv.invoice_number.substring(0, 12), 16, y);
      doc.text(format(new Date(inv.invoice_date), "dd/MM/yy"), 45, y);
      doc.text((inv.customer_name || "Walk-in").substring(0, 18), 70, y);
      doc.text(formatCurrency(Number(inv.taxable_amount || 0)), 110, y);
      doc.text(formatCurrency(Number(inv.cgst_amount || 0)), 135, y);
      doc.text(formatCurrency(Number(inv.sgst_amount || 0)), 155, y);
      doc.text(formatCurrency(Number(inv.grand_total || 0)), 175, y);
      
      y += 7;
    });
  };

  const generateLoanReport = async (doc: jsPDF, dateFrom: string, dateTo: string) => {
    if (!currentBranch?.id) return;

    const { data: loans } = await supabase
      .from("loans")
      .select("*, customer:customers(name, phone)")
      .eq("branch_id", currentBranch.id)
      .gte("loan_date", dateFrom)
      .lte("loan_date", dateTo)
      .order("loan_date");

    let y = addHeader(doc, "Loan Report", dateFrom, dateTo);

    // Summary
    const activeLoans = loans?.filter(l => l.status === "active") || [];
    const totalDisbursed = loans?.reduce((sum, l) => sum + Number(l.loan_amount || 0), 0) || 0;
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + Number(l.outstanding_total || 0), 0);
    const totalCollateral = loans?.reduce((sum, l) => sum + Number(l.collateral_value || 0), 0) || 0;

    doc.setFillColor(245, 245, 245);
    doc.rect(14, y, 182, 25, "F");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Loans: ${loans?.length || 0}`, 20, y + 8);
    doc.text(`Active Loans: ${activeLoans.length}`, 80, y + 8);
    doc.text(`Total Disbursed: ${formatCurrency(totalDisbursed)}`, 20, y + 16);
    doc.text(`Outstanding: ${formatCurrency(totalOutstanding)}`, 80, y + 16);
    doc.text(`Collateral Value: ${formatCurrency(totalCollateral)}`, 140, y + 16);
    
    y += 35;

    // Table header
    doc.setFillColor(66, 66, 66);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y, 182, 8, "F");
    doc.setFontSize(9);
    doc.text("Loan No", 16, y + 6);
    doc.text("Date", 40, y + 6);
    doc.text("Customer", 60, y + 6);
    doc.text("Amount", 100, y + 6);
    doc.text("Outstanding", 130, y + 6);
    doc.text("Status", 165, y + 6);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    loans?.forEach((loan, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 4, 182, 7, "F");
      }
      
      doc.text(loan.loan_number.substring(0, 12), 16, y);
      doc.text(format(new Date(loan.loan_date), "dd/MM/yy"), 40, y);
      doc.text((loan.customer?.name || "Unknown").substring(0, 18), 60, y);
      doc.text(formatCurrency(Number(loan.loan_amount)), 100, y);
      doc.text(formatCurrency(Number(loan.outstanding_total)), 130, y);
      doc.text(loan.status.toUpperCase(), 165, y);
      
      y += 7;
    });
  };

  const generateIncomeExpenseReport = async (doc: jsPDF, dateFrom: string, dateTo: string) => {
    if (!currentBranch?.id) return;

    const [invoicesRes, expensesRes, paymentsRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("grand_total, invoice_date")
        .eq("branch_id", currentBranch.id)
        .eq("invoice_type", "sale")
        .gte("invoice_date", dateFrom)
        .lte("invoice_date", dateTo),
      supabase
        .from("expenses")
        .select("*, category:expense_categories(name)")
        .eq("branch_id", currentBranch.id)
        .gte("expense_date", dateFrom)
        .lte("expense_date", dateTo)
        .order("expense_date"),
      supabase
        .from("payments")
        .select("amount, payment_date, payment_mode")
        .eq("branch_id", currentBranch.id)
        .gte("payment_date", dateFrom)
        .lte("payment_date", dateTo)
    ]);

    const invoices = invoicesRes.data || [];
    const expenses = expensesRes.data || [];
    const payments = paymentsRes.data || [];

    let y = addHeader(doc, "Income & Expense Report", dateFrom, dateTo);

    // Summary
    const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const totalCollections = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const netProfit = totalSales - totalExpenses;

    doc.setFillColor(245, 245, 245);
    doc.rect(14, y, 182, 30, "F");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Summary", 20, y + 8);
    
    doc.setFontSize(10);
    doc.text(`Total Sales: ${formatCurrency(totalSales)}`, 20, y + 16);
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 100, y + 16);
    doc.text(`Collections: ${formatCurrency(totalCollections)}`, 20, y + 24);
    
    doc.setFontSize(11);
    const profitColor = netProfit >= 0 ? [0, 128, 0] : [255, 0, 0];
    doc.setTextColor(profitColor[0], profitColor[1], profitColor[2]);
    doc.text(`Net Profit: ${formatCurrency(netProfit)}`, 100, y + 24);
    doc.setTextColor(0, 0, 0);
    
    y += 40;

    // Expense breakdown
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Breakdown", 14, y);
    y += 8;

    doc.setFillColor(66, 66, 66);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y, 182, 8, "F");
    doc.setFontSize(9);
    doc.text("Date", 16, y + 6);
    doc.text("Category", 45, y + 6);
    doc.text("Description", 90, y + 6);
    doc.text("Amount", 160, y + 6);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    expenses.forEach((exp, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 4, 182, 7, "F");
      }
      
      doc.text(format(new Date(exp.expense_date), "dd/MM/yy"), 16, y);
      doc.text((exp.category?.name || "Uncategorized").substring(0, 18), 45, y);
      doc.text((exp.description || "-").substring(0, 30), 90, y);
      doc.text(formatCurrency(Number(exp.amount)), 160, y);
      
      y += 7;
    });
  };

  const generateSalesRegister = async (doc: jsPDF, dateFrom: string, dateTo: string) => {
    if (!currentBranch?.id) return;

    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("branch_id", currentBranch.id)
      .eq("invoice_type", "sale")
      .gte("invoice_date", dateFrom)
      .lte("invoice_date", dateTo)
      .order("invoice_date");

    let y = addHeader(doc, "Sales Register", dateFrom, dateTo);

    const totalSales = invoices?.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0) || 0;
    const totalPaid = invoices?.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0) || 0;
    const totalDue = invoices?.reduce((sum, inv) => sum + Number(inv.balance_due || 0), 0) || 0;

    doc.setFillColor(245, 245, 245);
    doc.rect(14, y, 182, 20, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Sales: ${formatCurrency(totalSales)}`, 20, y + 8);
    doc.text(`Amount Received: ${formatCurrency(totalPaid)}`, 80, y + 8);
    doc.text(`Balance Due: ${formatCurrency(totalDue)}`, 140, y + 8);
    
    y += 30;

    doc.setFillColor(66, 66, 66);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y, 182, 8, "F");
    doc.setFontSize(9);
    doc.text("Invoice", 16, y + 6);
    doc.text("Date", 40, y + 6);
    doc.text("Customer", 60, y + 6);
    doc.text("Amount", 105, y + 6);
    doc.text("Paid", 135, y + 6);
    doc.text("Balance", 165, y + 6);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    invoices?.forEach((inv, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 4, 182, 7, "F");
      }
      
      doc.text(inv.invoice_number.substring(0, 12), 16, y);
      doc.text(format(new Date(inv.invoice_date), "dd/MM/yy"), 40, y);
      doc.text((inv.customer_name || "Walk-in").substring(0, 20), 60, y);
      doc.text(formatCurrency(Number(inv.grand_total)), 105, y);
      doc.text(formatCurrency(Number(inv.amount_paid || 0)), 135, y);
      doc.text(formatCurrency(Number(inv.balance_due || 0)), 165, y);
      
      y += 7;
    });
  };

  const generateStockSummary = async (doc: jsPDF) => {
    if (!currentBranch?.id) return;

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("branch_id", currentBranch.id)
      .eq("status", "in_stock")
      .order("metal_type");

    let y = addHeader(doc, "Stock Summary Report");

    // Summary by metal type
    const goldProducts = products?.filter(p => p.metal_type === "gold") || [];
    const silverProducts = products?.filter(p => p.metal_type === "silver") || [];
    
    const goldWeight = goldProducts.reduce((sum, p) => sum + Number(p.net_weight || 0), 0);
    const silverWeight = silverProducts.reduce((sum, p) => sum + Number(p.net_weight || 0), 0);
    const totalValue = products?.reduce((sum, p) => sum + Number(p.total_cost || 0), 0) || 0;

    doc.setFillColor(245, 245, 245);
    doc.rect(14, y, 182, 25, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Items: ${products?.length || 0}`, 20, y + 8);
    doc.text(`Gold Items: ${goldProducts.length} (${goldWeight.toFixed(3)} g)`, 20, y + 16);
    doc.text(`Silver Items: ${silverProducts.length} (${silverWeight.toFixed(3)} g)`, 100, y + 16);
    doc.text(`Total Stock Value: ${formatCurrency(totalValue)}`, 20, y + 24);
    
    y += 35;

    doc.setFillColor(66, 66, 66);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y, 182, 8, "F");
    doc.setFontSize(9);
    doc.text("SKU", 16, y + 6);
    doc.text("Name", 45, y + 6);
    doc.text("Metal", 95, y + 6);
    doc.text("Weight", 120, y + 6);
    doc.text("Qty", 145, y + 6);
    doc.text("Value", 165, y + 6);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    products?.forEach((prod, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 4, 182, 7, "F");
      }
      
      doc.text((prod.barcode || "-").substring(0, 12), 16, y);
      doc.text((prod.name || "-").substring(0, 22), 45, y);
      doc.text((prod.metal_type || "-").substring(0, 8), 95, y);
      doc.text(`${Number(prod.net_weight || 0).toFixed(2)} g`, 120, y);
      doc.text(String(prod.stock_quantity || 1), 145, y);
      doc.text(formatCurrency(Number(prod.total_cost || 0)), 165, y);
      
      y += 7;
    });
  };

  const generateReport = useCallback(async ({ reportType, dateFrom, dateTo }: ReportOptions) => {
    try {
      const today = new Date();
      const defaultFrom = dateFrom || format(startOfMonth(today), "yyyy-MM-dd");
      const defaultTo = dateTo || format(endOfMonth(today), "yyyy-MM-dd");

      const doc = new jsPDF();
      
      switch (reportType) {
        case "gst_summary":
          await generateGstSummary(doc, defaultFrom, defaultTo);
          break;
        case "loan_report":
          await generateLoanReport(doc, defaultFrom, defaultTo);
          break;
        case "income_expense":
          await generateIncomeExpenseReport(doc, defaultFrom, defaultTo);
          break;
        case "sales_register":
          await generateSalesRegister(doc, defaultFrom, defaultTo);
          break;
        case "stock_summary":
          await generateStockSummary(doc);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      // Add page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages);
      }

      const filename = `${reportType}_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
      doc.save(filename);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error("Failed to generate report");
    }
  }, [currentBranch?.id, businessSettings]);

  return { generateReport };
}
