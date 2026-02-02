import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataExport, ExportDataType } from "@/hooks/useDataExport";
import { useDataImport } from "@/hooks/useDataImport";
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Package, 
  Users, 
  Wrench, 
  Receipt, 
  Wallet, 
  PiggyBank,
  CreditCard,
  FolderOpen,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataTypeConfig {
  key: ExportDataType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "inventory" | "customers" | "finance" | "operations";
}

const dataTypes: DataTypeConfig[] = [
  {
    key: "products",
    label: "Products",
    description: "Jewelry inventory with weights, prices, and specifications",
    icon: <Package className="h-5 w-5" />,
    category: "inventory",
  },
  {
    key: "categories",
    label: "Categories",
    description: "Product categories with HSN codes and making charges",
    icon: <FolderOpen className="h-5 w-5" />,
    category: "inventory",
  },
  {
    key: "customers",
    label: "Customers",
    description: "Customer profiles with contact and KYC details",
    icon: <Users className="h-5 w-5" />,
    category: "customers",
  },
  {
    key: "karigars",
    label: "Karigars",
    description: "Artisan/craftsman details and metal balances",
    icon: <Wrench className="h-5 w-5" />,
    category: "operations",
  },
  {
    key: "staff",
    label: "Staff",
    description: "Staff profiles and role assignments",
    icon: <Users className="h-5 w-5" />,
    category: "operations",
  },
  {
    key: "expenses",
    label: "Expenses",
    description: "Expense records with categories and GST",
    icon: <Receipt className="h-5 w-5" />,
    category: "finance",
  },
  {
    key: "schemes",
    label: "Schemes",
    description: "Savings scheme configurations",
    icon: <PiggyBank className="h-5 w-5" />,
    category: "finance",
  },
  {
    key: "scheme_enrollments",
    label: "Scheme Enrollments",
    description: "Customer enrollments in savings schemes",
    icon: <PiggyBank className="h-5 w-5" />,
    category: "finance",
  },
  {
    key: "scheme_payments",
    label: "Scheme Payments",
    description: "Monthly installment payments for schemes",
    icon: <CreditCard className="h-5 w-5" />,
    category: "finance",
  },
  {
    key: "loans",
    label: "Loans",
    description: "Gold loan records with collateral details",
    icon: <Wallet className="h-5 w-5" />,
    category: "finance",
  },
  {
    key: "loan_payments",
    label: "Loan Payments",
    description: "Interest and principal payments for loans",
    icon: <CreditCard className="h-5 w-5" />,
    category: "finance",
  },
  {
    key: "invoices",
    label: "Invoices",
    description: "Sales invoices with GST breakdown",
    icon: <FileText className="h-5 w-5" />,
    category: "finance",
  },
  {
    key: "payments",
    label: "Payments",
    description: "Payment receipts and collections",
    icon: <CreditCard className="h-5 w-5" />,
    category: "finance",
  },
];

const categoryLabels = {
  inventory: "Inventory",
  customers: "Customers",
  finance: "Finance & Billing",
  operations: "Operations",
};

export function DataImportExportTab() {
  const { exportData } = useDataExport();
  const { importData, isImporting } = useDataImport();
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleExport = async (dataType: ExportDataType, format: "csv" | "excel") => {
    await exportData({ dataType, format });
  };

  const handleImportClick = (dataType: ExportDataType) => {
    const input = fileInputRefs.current[dataType];
    if (input) {
      input.click();
    }
  };

  const handleFileChange = async (dataType: ExportDataType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = [".csv", ".xlsx", ".xls"];
    const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValid) {
      toast.error("Please select a CSV or Excel file");
      return;
    }

    try {
      const result = await importData(file, dataType);
      setImportResult(result);
      setShowResultDialog(true);
    } catch (error) {
      console.error("Import failed:", error);
    }

    // Reset input
    event.target.value = "";
  };

  const renderDataTypeCard = (config: DataTypeConfig) => (
    <Card key={config.key} className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {config.icon}
            </div>
            <div>
              <CardTitle className="text-base">{config.label}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {config.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 mt-auto">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport(config.key, "csv")}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport(config.key, "excel")}
            className="flex-1"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleImportClick(config.key)}
            disabled={isImporting}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <input
            ref={el => fileInputRefs.current[config.key] = el}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFileChange(config.key, e)}
          />
        </div>
      </CardContent>
    </Card>
  );

  const groupedDataTypes = dataTypes.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, DataTypeConfig[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Import & Export
          </CardTitle>
          <CardDescription>
            Export your data to CSV or Excel files, or import data from external sources.
            All exports are filtered to your current branch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Import Tips:</strong> When importing data, ensure your file columns match the expected format.
              The ID, created_at, and updated_at columns will be auto-generated. Download an export first to see the expected format.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="inventory" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                  {label}
                  <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                    {groupedDataTypes[key]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(categoryLabels).map(([key]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedDataTypes[key]?.map(renderDataTypeCard)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Complete</DialogTitle>
            <DialogDescription>
              Here are the results of your data import.
            </DialogDescription>
          </DialogHeader>
          
          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-green-700">{importResult.success}</div>
                    <p className="text-sm text-green-600">Records imported successfully</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-red-700">{importResult.failed}</div>
                    <p className="text-sm text-red-600">Records failed</p>
                  </CardContent>
                </Card>
              </div>

              {importResult.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Errors:</p>
                  {importResult.errors.slice(0, 10).map((error, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{error}</p>
                  ))}
                  {importResult.errors.length > 10 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ...and {importResult.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              )}

              <Button onClick={() => setShowResultDialog(false)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
