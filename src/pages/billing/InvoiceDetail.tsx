import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Printer, CreditCard, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoicePrintTemplate } from "@/components/billing/InvoicePrintTemplate";
import { PaymentDialog } from "@/components/billing/PaymentDialog";
import { useInvoice, useUpdateInvoiceStatus } from "@/hooks/useInvoices";
import { formatCurrency, formatWeight, formatDate } from "@/lib/formatters";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  confirmed: "bg-blue-500",
  paid: "bg-green-500",
  partially_paid: "bg-yellow-500",
  cancelled: "bg-red-500",
  returned: "bg-orange-500",
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [showPayment, setShowPayment] = useState(false);
  
  const { data: invoice, isLoading } = useInvoice(id || "");
  const updateStatus = useUpdateInvoiceStatus();
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${invoice?.invoice_number || ""}`,
  });
  
  const handleStatusUpdate = async (status: "confirmed" | "cancelled") => {
    if (!id) return;
    await updateStatus.mutateAsync({ id, status });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }
  
  if (!invoice) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Invoice not found</h1>
        </div>
      </div>
    );
  }
  
  const items = invoice.items || [];
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
            <p className="text-muted-foreground">{formatDate(invoice.invoice_date)}</p>
          </div>
          <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
        </div>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <>
              <Button variant="outline" onClick={() => handleStatusUpdate("cancelled")}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => handleStatusUpdate("confirmed")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </>
          )}
          {["confirmed", "partially_paid"].includes(invoice.status) && (
            <Button variant="outline" onClick={() => setShowPayment(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
          <Button onClick={() => handlePrint()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{invoice.customer_name || "Walk-in Customer"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{invoice.customer_phone || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{invoice.customer_address || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">GSTIN</p>
                <p className="font-medium">{invoice.customer_gstin || "-"}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                    <TableHead className="text-right">Metal Value</TableHead>
                    <TableHead className="text-right">Making</TableHead>
                    <TableHead className="text-right">Stone</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.item_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.item_code} | HSN: {item.hsn_code}
                        </div>
                        {item.metal_type && (
                          <div className="text-xs text-muted-foreground capitalize">
                            {item.metal_type} {item.purity}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.gross_weight ? formatWeight(item.gross_weight) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.metal_value || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.making_charges || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.stone_value || 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.taxable_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Amount:</span>
                <span>{formatCurrency(invoice.gross_amount)}</span>
              </div>
              
              {Number(invoice.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({invoice.discount_percent}%):</span>
                  <span>-{formatCurrency(invoice.discount_amount || 0)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium">
                <span>Taxable Amount:</span>
                <span>{formatCurrency(invoice.taxable_amount)}</span>
              </div>
              
              <Separator />
              
              {invoice.is_interstate ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGST (3%):</span>
                  <span>{formatCurrency(invoice.igst_amount || 0)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST (1.5%):</span>
                    <span>{formatCurrency(invoice.cgst_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST (1.5%):</span>
                    <span>{formatCurrency(invoice.sgst_amount || 0)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between font-medium">
                <span>Total GST:</span>
                <span>{formatCurrency(invoice.total_gst || 0)}</span>
              </div>
              
              <Separator />
              
              {Number(invoice.old_gold_amount) > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Old Gold Adjustment:</span>
                  <span>-{formatCurrency(invoice.old_gold_amount || 0)}</span>
                </div>
              )}
              
              {Number(invoice.round_off) !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Round Off:</span>
                  <span>{Number(invoice.round_off) > 0 ? "+" : ""}{formatCurrency(invoice.round_off || 0)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span className="text-primary">{formatCurrency(invoice.grand_total)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="text-green-600">{formatCurrency(invoice.amount_paid || 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Balance Due:</span>
                <span className={Number(invoice.balance_due) > 0 ? "text-destructive" : ""}>
                  {formatCurrency(invoice.balance_due || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Payments */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium capitalize">{payment.payment_mode.replace("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.payment_date)}</p>
                    </div>
                    <span className="font-medium text-green-600">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Hidden Print Template */}
      <div className="hidden">
        <InvoicePrintTemplate ref={printRef} invoice={invoice} items={items} />
      </div>
      
      {/* Payment Dialog */}
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        invoice={invoice}
      />
    </div>
  );
}
