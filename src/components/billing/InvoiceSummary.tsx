import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";
import { calculateGST, roundForInvoice } from "@/lib/calculations";
import type { InvoiceItemFormData } from "@/types/billing";

interface InvoiceSummaryProps {
  items: InvoiceItemFormData[];
  discountPercent: number;
  oldGoldAmount: number;
  isInterstate: boolean;
  onTotalsChange?: (totals: {
    grossAmount: number;
    discountAmount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalGst: number;
    roundOff: number;
    grandTotal: number;
  }) => void;
}

export function InvoiceSummary({
  items,
  discountPercent,
  oldGoldAmount,
  isInterstate,
  onTotalsChange,
}: InvoiceSummaryProps) {
  // Calculate item totals
  const itemTotals = items.map((item) => {
    const subtotal = item.metal_value + item.making_charges + item.stone_value + item.other_charges;
    const itemDiscount = subtotal * (item.discount_percent / 100);
    return subtotal - itemDiscount;
  });
  
  const grossAmount = itemTotals.reduce((sum, total) => sum + total, 0);
  const overallDiscount = grossAmount * (discountPercent / 100);
  const taxableAmount = grossAmount - overallDiscount;
  
  // Calculate GST
  const gst = calculateGST(taxableAmount, isInterstate);
  
  // Calculate final amount
  const preRoundTotal = gst.grandTotal - oldGoldAmount;
  const { rounded, adjustment } = roundForInvoice(preRoundTotal);
  
  // Notify parent of totals
  if (onTotalsChange) {
    onTotalsChange({
      grossAmount,
      discountAmount: overallDiscount,
      taxableAmount,
      cgstAmount: gst.cgst,
      sgstAmount: gst.sgst,
      igstAmount: gst.igst,
      totalGst: gst.totalGst,
      roundOff: adjustment,
      grandTotal: rounded,
    });
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gross Amount:</span>
          <span>{formatCurrency(grossAmount)}</span>
        </div>
        
        {overallDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discountPercent}%):</span>
            <span>-{formatCurrency(overallDiscount)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-medium">
          <span>Taxable Amount:</span>
          <span>{formatCurrency(taxableAmount)}</span>
        </div>
        
        <Separator />
        
        {isInterstate ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">IGST (3%):</span>
            <span>{formatCurrency(gst.igst)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CGST (1.5%):</span>
              <span>{formatCurrency(gst.cgst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SGST (1.5%):</span>
              <span>{formatCurrency(gst.sgst)}</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between font-medium">
          <span>Total GST:</span>
          <span>{formatCurrency(gst.totalGst)}</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sub Total:</span>
          <span>{formatCurrency(gst.grandTotal)}</span>
        </div>
        
        {oldGoldAmount > 0 && (
          <div className="flex justify-between text-amber-600">
            <span>Old Gold Adjustment:</span>
            <span>-{formatCurrency(oldGoldAmount)}</span>
          </div>
        )}
        
        {adjustment !== 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Round Off:</span>
            <span>{adjustment > 0 ? "+" : ""}{formatCurrency(adjustment)}</span>
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-between text-lg font-bold">
          <span>Grand Total:</span>
          <span className="text-primary">{formatCurrency(rounded)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
