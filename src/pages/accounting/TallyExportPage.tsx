import { useState } from "react";
import { Download, BookOpen, ShoppingBag, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTallyExport } from "@/hooks/useTallyExport";

export default function TallyExportPage() {
  const { exportLedgerMasters, exportVouchers, exportStockItems } = useTallyExport();
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, number>>({});

  const handleExport = async (type: string) => {
    setLoading(type);
    let count = 0;
    try {
      switch (type) {
        case "ledgers":
          count = await exportLedgerMasters();
          break;
        case "vouchers":
          count = await exportVouchers(dateFrom, dateTo);
          break;
        case "stock":
          count = await exportStockItems();
          break;
      }
      setResults((prev) => ({ ...prev, [type]: count }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tally Integration</h1>
        <p className="text-muted-foreground">Export data in Tally-compatible XML format for import into Tally ERP/Prime</p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Import into Tally</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>1. Export the required XML files from below.</p>
          <p>2. Open Tally ERP 9 / Tally Prime and select the target company.</p>
          <p>3. Go to <strong>Gateway of Tally → Import Data</strong>.</p>
          <p>4. Select the downloaded XML file and import.</p>
          <p>5. Import <strong>Ledger Masters</strong> first, then <strong>Stock Items</strong>, and finally <strong>Vouchers</strong>.</p>
        </CardContent>
      </Card>

      {/* Export Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Ledger Masters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <BookOpen className="h-8 w-8 text-primary" />
              {results.ledgers !== undefined && results.ledgers > 0 && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />{results.ledgers} exported
                </Badge>
              )}
            </div>
            <CardTitle>Ledger Masters</CardTitle>
            <CardDescription>Chart of accounts with opening balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All active ledger accounts</li>
              <li>• Mapped to Tally account groups</li>
              <li>• Opening balances included</li>
            </ul>
            <Button
              className="w-full"
              onClick={() => handleExport("ledgers")}
              disabled={loading === "ledgers"}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading === "ledgers" ? "Exporting..." : "Export Ledgers"}
            </Button>
          </CardContent>
        </Card>

        {/* Vouchers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              {results.vouchers !== undefined && results.vouchers > 0 && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />{results.vouchers} exported
                </Badge>
              )}
            </div>
            <CardTitle>Vouchers</CardTitle>
            <CardDescription>Journal entries as Tally vouchers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Sales, Purchase, Receipt, Payment, Journal</li>
              <li>• Auto-mapped voucher types</li>
            </ul>
            <Button
              className="w-full"
              onClick={() => handleExport("vouchers")}
              disabled={loading === "vouchers"}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading === "vouchers" ? "Exporting..." : "Export Vouchers"}
            </Button>
          </CardContent>
        </Card>

        {/* Stock Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <ShoppingBag className="h-8 w-8 text-primary" />
              {results.stock !== undefined && results.stock > 0 && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />{results.stock} exported
                </Badge>
              )}
            </div>
            <CardTitle>Stock Items</CardTitle>
            <CardDescription>Products & categories as Tally stock items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Stock groups from categories</li>
              <li>• All active products as stock items</li>
              <li>• Opening stock quantities & values</li>
            </ul>
            <Button
              className="w-full"
              onClick={() => handleExport("stock")}
              disabled={loading === "stock"}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading === "stock" ? "Exporting..." : "Export Stock Items"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}