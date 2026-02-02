import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReportPdfGenerator, ReportType } from "@/hooks/useReportPdfGenerator";
import { 
  FileDown, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  ShoppingCart,
  Package,
  Calendar
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface ReportConfig {
  type: ReportType;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresDates: boolean;
}

const reports: ReportConfig[] = [
  {
    type: "gst_summary",
    label: "GST Summary Report",
    description: "Detailed GST breakdown with CGST, SGST, IGST for all invoices. Perfect for GST return filing.",
    icon: <Receipt className="h-6 w-6" />,
    requiresDates: true,
  },
  {
    type: "loan_report",
    label: "Loan Report",
    description: "Complete loan portfolio with outstanding amounts, collateral values, and payment status.",
    icon: <Wallet className="h-6 w-6" />,
    requiresDates: true,
  },
  {
    type: "income_expense",
    label: "Income & Expense Report",
    description: "Financial summary showing sales income, expenses breakdown, and net profit calculation.",
    icon: <TrendingUp className="h-6 w-6" />,
    requiresDates: true,
  },
  {
    type: "sales_register",
    label: "Sales Register",
    description: "Complete sales record with invoice details, amounts received, and outstanding balances.",
    icon: <ShoppingCart className="h-6 w-6" />,
    requiresDates: true,
  },
  {
    type: "stock_summary",
    label: "Stock Summary",
    description: "Current inventory snapshot with metal weights, quantities, and stock values.",
    icon: <Package className="h-6 w-6" />,
    requiresDates: false,
  },
];

const quickDateRanges = [
  { label: "This Month", getRange: () => ({ from: format(startOfMonth(new Date()), "yyyy-MM-dd"), to: format(endOfMonth(new Date()), "yyyy-MM-dd") }) },
  { label: "Last Month", getRange: () => ({ from: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"), to: format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd") }) },
  { label: "Last 3 Months", getRange: () => ({ from: format(startOfMonth(subMonths(new Date(), 2)), "yyyy-MM-dd"), to: format(endOfMonth(new Date()), "yyyy-MM-dd") }) },
  { label: "This Year", getRange: () => ({ from: `${new Date().getFullYear()}-01-01`, to: format(new Date(), "yyyy-MM-dd") }) },
  { label: "Last Year", getRange: () => ({ from: `${new Date().getFullYear() - 1}-01-01`, to: `${new Date().getFullYear() - 1}-12-31` }) },
];

export function ReportsDownloadTab() {
  const { generateReport } = useReportPdfGenerator();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [generating, setGenerating] = useState<ReportType | null>(null);

  const handleGenerateReport = async (reportType: ReportType, requiresDates: boolean) => {
    setGenerating(reportType);
    try {
      await generateReport({
        reportType,
        dateFrom: requiresDates ? dateFrom : undefined,
        dateTo: requiresDates ? dateTo : undefined,
      });
    } finally {
      setGenerating(null);
    }
  };

  const applyDateRange = (range: { from: string; to: string }) => {
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            PDF Reports
          </CardTitle>
          <CardDescription>
            Generate professional PDF reports for GST filing, financial analysis, and business records.
            All reports are formatted for printing and official use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Selector */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Report Period</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {quickDateRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="outline"
                  size="sm"
                  onClick={() => applyDateRange(range.getRange())}
                >
                  {range.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Report Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <Card key={report.type} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      {report.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.label}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleGenerateReport(report.type, report.requiresDates)}
                    disabled={generating === report.type}
                    className="w-full"
                  >
                    {generating === report.type ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                  {!report.requiresDates && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Shows current snapshot (dates not applicable)
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
