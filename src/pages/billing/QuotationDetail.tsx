import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Printer, Mail, Loader2, ArrowRightLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuotationPrintTemplate } from "@/components/billing/QuotationPrintTemplate";
import { useQuotation, useUpdateQuotationStatus, useConvertQuotationToInvoice } from "@/hooks/useQuotations";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { usePdfGenerator } from "@/hooks/usePdfGenerator";
import { formatCurrency, formatWeight, formatDate } from "@/lib/formatters";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-gray-500",
  converted: "bg-purple-500",
};

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const { data: quotation, isLoading } = useQuotation(id || "");
  const updateStatus = useUpdateQuotationStatus();
  const convertToInvoice = useConvertQuotationToInvoice();
  const { sendQuotationEmail } = useEmailNotifications();
  const { generatePdfBase64 } = usePdfGenerator();
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Quotation-${quotation?.quotation_number || ""}`,
  });
  
  const handleStatusUpdate = async (status: "sent" | "accepted" | "rejected") => {
    if (!id) return;
    await updateStatus.mutateAsync({ id, status });
  };

  const handleConvert = async () => {
    if (!id) return;
    await convertToInvoice.mutateAsync(id);
    navigate("/billing/invoices");
  };

  const handleSendEmail = async () => {
    if (!quotation) return;
    
    const customerEmail = quotation.customer?.email;
    if (!customerEmail) {
      toast.error("No customer email available");
      return;
    }
    
    setIsSendingEmail(true);
    try {
      // Generate PDF from print template
      const pdfResult = await generatePdfBase64(
        printRef.current,
        `Quotation_${quotation.quotation_number}`
      );
      
      const success = await sendQuotationEmail(
        customerEmail,
        quotation.customer_name || "Customer",
        {
          quotationNumber: quotation.quotation_number,
          date: formatDate(quotation.quotation_date),
          validUntil: quotation.valid_until ? formatDate(quotation.valid_until) : "",
          totalAmount: quotation.grand_total,
        },
        pdfResult?.base64
      );
      
      if (success) {
        toast.success("Quotation email sent successfully with PDF attachment");
        // Auto-update status to "sent" if still draft
        if (quotation.status === "draft") {
          await updateStatus.mutateAsync({ id: quotation.id, status: "sent" });
        }
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      console.error("Email error:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
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
  
  if (!quotation) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Quotation not found</h1>
        </div>
      </div>
    );
  }
  
  const items = quotation.items || [];
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quotation.quotation_number}</h1>
            <p className="text-muted-foreground">{formatDate(quotation.quotation_date)}</p>
          </div>
          <Badge className={statusColors[quotation.status]}>{quotation.status}</Badge>
        </div>
        <div className="flex gap-2">
          {quotation.status === "draft" && (
            <Button variant="outline" onClick={() => handleStatusUpdate("sent")}>
              Mark as Sent
            </Button>
          )}
          {quotation.status === "sent" && (
            <>
              <Button variant="outline" onClick={() => handleStatusUpdate("accepted")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button variant="outline" onClick={() => handleStatusUpdate("rejected")}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {(quotation.status === "accepted" || quotation.status === "sent") && (
            <Button 
              variant="outline" 
              onClick={handleConvert}
              disabled={convertToInvoice.isPending}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Convert to Invoice
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleSendEmail} 
            disabled={isSendingEmail || !quotation.customer?.email}
            title={!quotation.customer?.email ? "Customer has no email address" : "Send quotation via email"}
          >
            {isSendingEmail ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send Email
          </Button>
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
                <p className="font-medium">{quotation.customer_name || "Walk-in Customer"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{quotation.customer_phone || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{quotation.customer_address || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valid Until</p>
                <p className="font-medium">{quotation.valid_until ? formatDate(quotation.valid_until) : "-"}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quotation Items</CardTitle>
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
                        {formatCurrency(item.taxable_amount || item.total_amount)}
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
              <CardTitle className="text-base">Quotation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Amount:</span>
                <span>{formatCurrency(quotation.gross_amount)}</span>
              </div>
              
              {Number(quotation.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({quotation.discount_percent}%):</span>
                  <span>-{formatCurrency(quotation.discount_amount || 0)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium">
                <span>Taxable Amount:</span>
                <span>{formatCurrency(quotation.taxable_amount)}</span>
              </div>
              
              <Separator />
              
              {quotation.is_interstate ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGST (3%):</span>
                  <span>{formatCurrency(quotation.igst_amount || 0)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST (1.5%):</span>
                    <span>{formatCurrency(quotation.cgst_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST (1.5%):</span>
                    <span>{formatCurrency(quotation.sgst_amount || 0)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between font-medium">
                <span>Total GST:</span>
                <span>{formatCurrency(quotation.total_gst || 0)}</span>
              </div>
              
              <Separator />
              
              {Number(quotation.round_off) !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Round Off:</span>
                  <span>{Number(quotation.round_off) > 0 ? "+" : ""}{formatCurrency(quotation.round_off || 0)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span className="text-primary">{formatCurrency(quotation.grand_total)}</span>
              </div>
            </CardContent>
          </Card>
          
          {quotation.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Hidden Print Template */}
      <div className="hidden">
        <QuotationPrintTemplate ref={printRef} quotation={quotation} items={items} />
      </div>
    </div>
  );
}
