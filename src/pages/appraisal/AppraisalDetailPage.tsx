import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppraisal, useUpdateAppraisalStatus } from "@/hooks/useAppraisals";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function AppraisalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: appraisal, isLoading } = useAppraisal(id || "");
  const updateStatus = useUpdateAppraisalStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading appraisal...</p>
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Appraisal not found</p>
        <Button variant="outline" onClick={() => navigate("/appraisals")}>Back to Appraisals</Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    certificate_issued: "bg-purple-100 text-purple-800",
    expired: "bg-red-100 text-red-800",
  };

  const purposeLabels: Record<string, string> = {
    valuation: "Valuation",
    insurance: "Insurance",
    loan: "Loan",
    sale: "Sale",
    purchase: "Purchase",
  };

  const items = (appraisal as any).appraisal_items || [];

  const handleIssueCertificate = async () => {
    const certNumber = `CERT-${Date.now().toString(36).toUpperCase()}`;
    await updateStatus.mutateAsync({
      id: appraisal.id,
      status: "certificate_issued",
      certificate_number: certNumber,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/appraisals")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{appraisal.appraisal_number}</h1>
            <p className="text-muted-foreground">
              {formatDate(appraisal.appraisal_date)} · {purposeLabels[appraisal.purpose] || appraisal.purpose}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColors[appraisal.status] || ""}>
            {appraisal.status.replace("_", " ")}
          </Badge>
          {appraisal.status === "completed" && (
            <Button size="sm" onClick={handleIssueCertificate} disabled={updateStatus.isPending}>
              <Award className="h-4 w-4 mr-2" />Issue Certificate
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />Print
          </Button>
        </div>
      </div>

      {/* Customer & Market Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Customer Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{appraisal.customer_name || "Walk-in"}</span>
            </div>
            {appraisal.customer_phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{appraisal.customer_phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purpose</span>
              <span>{purposeLabels[appraisal.purpose] || appraisal.purpose}</span>
            </div>
            {appraisal.appraised_by && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Appraised By</span>
                <span>{appraisal.appraised_by}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Market Rates at Appraisal</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gold 24K Rate</span>
              <span className="font-medium">{formatCurrency(appraisal.market_rate_gold || 0)}/g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Silver 999 Rate</span>
              <span className="font-medium">{formatCurrency(appraisal.market_rate_silver || 0)}/g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid Until</span>
              <span>{appraisal.valid_until ? formatDate(appraisal.valid_until) : "-"}</span>
            </div>
            {appraisal.certificate_number && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate No.</span>
                <span className="font-mono text-sm">{appraisal.certificate_number}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader><CardTitle>Appraisal Items ({items.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Metal</TableHead>
                <TableHead>Purity</TableHead>
                <TableHead>Gross Wt.</TableHead>
                <TableHead>Net Wt.</TableHead>
                <TableHead>Rate/g</TableHead>
                <TableHead>Metal Value</TableHead>
                <TableHead>Stone Value</TableHead>
                <TableHead>Making</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No items found</TableCell>
                </TableRow>
              ) : (
                items.map((item: any, idx: number) => (
                  <TableRow key={item.id || idx}>
                    <TableCell>{item.item_number || idx + 1}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.description}</div>
                        {item.hallmark_status && (
                          <span className="text-xs text-muted-foreground capitalize">{item.hallmark_status.replace("_", " ")}</span>
                        )}
                        {item.huid && <span className="text-xs font-mono ml-2">HUID: {item.huid}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{item.metal_type}</TableCell>
                    <TableCell>{item.purity}</TableCell>
                    <TableCell>{item.gross_weight?.toFixed(3)}g</TableCell>
                    <TableCell>{item.net_weight?.toFixed(3)}g</TableCell>
                    <TableCell>{formatCurrency(item.rate_per_gram || 0)}</TableCell>
                    <TableCell>{formatCurrency(item.metal_value || 0)}</TableCell>
                    <TableCell>{formatCurrency(item.stone_value || 0)}</TableCell>
                    <TableCell>{formatCurrency(item.making_charge_value || 0)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(item.total_value || 0)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader><CardTitle>Valuation Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-bold">{appraisal.total_items}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Weight</p>
              <p className="text-xl font-bold">{appraisal.total_weight.toFixed(3)}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Metal Value</p>
              <p className="text-xl font-bold">{formatCurrency(appraisal.total_metal_value)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stone + Making</p>
              <p className="text-xl font-bold">{formatCurrency(appraisal.total_stone_value + appraisal.total_making_value)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(appraisal.grand_total)}</p>
            </div>
          </div>
          {appraisal.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{appraisal.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}