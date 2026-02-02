import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { ExportDataType } from "./useDataExport";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function useDataImport() {
  const { currentBranch } = useBranch();
  const [isImporting, setIsImporting] = useState(false);

  const parseFile = useCallback(async (file: File): Promise<Record<string, unknown>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          
          if (file.name.endsWith(".csv")) {
            // Parse CSV
            const text = data as string;
            const lines = text.split("\n").filter(line => line.trim());
            const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
            
            const records = lines.slice(1).map(line => {
              const values = line.match(/("([^"]*("")*)*"|[^,]*)/g) || [];
              const record: Record<string, unknown> = {};
              headers.forEach((header, index) => {
                let value = values[index]?.trim().replace(/^"|"$/g, "").replace(/""/g, '"') || "";
                // Try to parse numbers
                if (value && !isNaN(Number(value))) {
                  record[header] = Number(value);
                } else if (value === "true" || value === "false") {
                  record[header] = value === "true";
                } else {
                  record[header] = value || null;
                }
              });
              return record;
            });
            
            resolve(records);
          } else {
            // Parse Excel
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const records = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
            resolve(records);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read file"));
      
      if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  }, []);

  const importData = useCallback(async (
    file: File, 
    dataType: ExportDataType
  ): Promise<ImportResult> => {
    if (!currentBranch?.id) {
      throw new Error("No branch selected");
    }

    setIsImporting(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      const records = await parseFile(file);
      
      if (records.length === 0) {
        throw new Error("No data found in file");
      }

      const branchId = currentBranch.id;

      for (const record of records) {
        try {
          // Remove id and timestamps - let database generate them
          const { id, created_at, updated_at, ...cleanRecord } = record as Record<string, unknown>;
          
          // Add branch_id for branch-scoped tables
          const branchScopedTypes: ExportDataType[] = [
            "products", "customers", "karigars", "expenses", 
            "scheme_enrollments", "scheme_payments", "loans", 
            "loan_payments", "invoices", "payments"
          ];
          
          const dataToInsert = branchScopedTypes.includes(dataType) 
            ? { ...cleanRecord, branch_id: branchId }
            : cleanRecord;

          const tableName = dataType === "staff" ? "profiles" : dataType;
          
          const { error } = await supabase
            .from(tableName)
            .insert(dataToInsert as never);

          if (error) {
            result.failed++;
            result.errors.push(`Row failed: ${error.message}`);
          } else {
            result.success++;
          }
        } catch (err) {
          result.failed++;
          result.errors.push(`Row failed: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }

      if (result.success > 0) {
        toast.success(`Imported ${result.success} records successfully`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} records failed to import`);
      }

      return result;
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import data");
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, [currentBranch?.id, parseFile]);

  return { importData, isImporting };
}
