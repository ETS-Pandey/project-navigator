import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export type ExportDataType = 
  | "products" 
  | "categories" 
  | "customers" 
  | "karigars" 
  | "staff" 
  | "expenses" 
  | "schemes" 
  | "scheme_enrollments"
  | "scheme_payments"
  | "loans" 
  | "loan_payments"
  | "invoices"
  | "payments";

interface ExportOptions {
  format: "csv" | "excel";
  dataType: ExportDataType;
}

export function useDataExport() {
  const { currentBranch } = useBranch();

  const fetchData = useCallback(async (dataType: ExportDataType) => {
    if (!currentBranch?.id) throw new Error("No branch selected");

    const branchId = currentBranch.id;

    switch (dataType) {
      case "products": {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data;
      }
      case "categories": {
        const { data, error } = await supabase
          .from("categories")
          .select("*");
        if (error) throw error;
        return data;
      }
      case "customers": {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data;
      }
      case "karigars": {
        const { data, error } = await supabase
          .from("karigars")
          .select("*")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data;
      }
      case "staff": {
        const { data, error } = await supabase
          .from("profiles")
          .select("*");
        if (error) throw error;
        return data;
      }
      case "expenses": {
        const { data, error } = await supabase
          .from("expenses")
          .select("*, category:expense_categories(name)")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data?.map(e => ({
          ...e,
          category_name: e.category?.name,
          category: undefined
        }));
      }
      case "schemes": {
        const { data, error } = await supabase
          .from("schemes")
          .select("*");
        if (error) throw error;
        return data;
      }
      case "scheme_enrollments": {
        const { data, error } = await supabase
          .from("scheme_enrollments")
          .select("*, customer:customers(name, phone), scheme:schemes(scheme_name)")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data?.map(e => ({
          ...e,
          customer_name: e.customer?.name,
          customer_phone: e.customer?.phone,
          scheme_name: e.scheme?.scheme_name,
          customer: undefined,
          scheme: undefined
        }));
      }
      case "scheme_payments": {
        const { data, error } = await supabase
          .from("scheme_payments")
          .select("*, enrollment:scheme_enrollments(enrollment_number)")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data?.map(p => ({
          ...p,
          enrollment_number: p.enrollment?.enrollment_number,
          enrollment: undefined
        }));
      }
      case "loans": {
        const { data, error } = await supabase
          .from("loans")
          .select("*, customer:customers(name, phone)")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data?.map(l => ({
          ...l,
          customer_name: l.customer?.name,
          customer_phone: l.customer?.phone,
          customer: undefined
        }));
      }
      case "loan_payments": {
        const { data, error } = await supabase
          .from("loan_payments")
          .select("*, loan:loans(loan_number)")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data?.map(p => ({
          ...p,
          loan_number: p.loan?.loan_number,
          loan: undefined
        }));
      }
      case "invoices": {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data;
      }
      case "payments": {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("branch_id", branchId);
        if (error) throw error;
        return data;
      }
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }, [currentBranch?.id]);

  const exportToCSV = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(",")
      )
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} records to CSV`);
  }, []);

  const exportToExcel = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    // Auto-size columns
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || "").length))
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `${filename}.xlsx`);
    toast.success(`Exported ${data.length} records to Excel`);
  }, []);

  const exportData = useCallback(async ({ format, dataType }: ExportOptions) => {
    try {
      const data = await fetchData(dataType);
      const filename = `${dataType}_export_${new Date().toISOString().split("T")[0]}`;
      
      if (format === "csv") {
        exportToCSV(data || [], filename);
      } else {
        exportToExcel(data || [], filename);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  }, [fetchData, exportToCSV, exportToExcel]);

  return { exportData };
}
