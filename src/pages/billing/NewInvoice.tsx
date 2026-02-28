import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerSelect } from "@/components/billing/CustomerSelect";
import { ProductSelector } from "@/components/billing/ProductSelector";
import { InvoiceItemRow } from "@/components/billing/InvoiceItemRow";
import { InvoiceSummary } from "@/components/billing/InvoiceSummary";
import { useCreateInvoice } from "@/hooks/useInvoices";
import { useRates } from "@/contexts/RateContext";
import type { Customer, InvoiceItemFormData } from "@/types/billing";
import type { Product } from "@/types/inventory";

export default function NewInvoice() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const { getGoldRate, getSilverRate } = useRates();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceItemFormData[]>([]);
  const [isInterstate, setIsInterstate] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [oldGoldAmount, setOldGoldAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [totals, setTotals] = useState({
    grossAmount: 0, discountAmount: 0, taxableAmount: 0,
    cgstAmount: 0, sgstAmount: 0, igstAmount: 0,
    totalGst: 0, roundOff: 0, grandTotal: 0,
  });

  const handleProductSelect = useCallback((product: Product) => {
    const rate = product.metal_type === "gold"
      ? getGoldRate(product.purity as "24K" | "22K" | "18K" | "14K", "sell")
      : getSilverRate(product.purity as "999" | "925", "sell");

    const newItem: InvoiceItemFormData = {
      product_id: product.id,
      item_code: product.item_code,
      item_name: product.name,
      hsn_code: "7113",
      metal_type: product.metal_type,
      purity: product.purity,
      gross_weight: product.gross_weight,
      net_weight: product.net_weight,
      rate_per_gram: rate || 0,
      metal_value: product.metal_value || 0,
      making_charge_type: product.making_charge_type,
      making_charge_value: product.making_charge_value,
      making_charges: product.making_charge_amount || 0,
      stone_value: product.stone_value || 0,
      other_charges: 0,
      quantity: 1,
      unit_price: product.mrp || product.total_cost || 0,
      discount_percent: 0,
    };
    setItems((prev) => [...prev, newItem]);
  }, [getGoldRate, getSilverRate]);

  const handleUpdateItem = useCallback((index: number, field: keyof InvoiceItemFormData, value: unknown) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = async (status: "draft" | "confirmed") => {
    await createInvoice.mutateAsync({
      invoiceData: {
        customer_id: customer?.id,
        customer_name: customer?.name,
        customer_phone: customer?.phone,
        customer_address: customer?.address,
        customer_gstin: customer?.gstin,
        status,
        is_interstate: isInterstate,
        discount_percent: discountPercent,
        old_gold_amount: oldGoldAmount,
        notes,
        gross_amount: totals.grossAmount,
        discount_amount: totals.discountAmount,
        taxable_amount: totals.taxableAmount,
        cgst_amount: totals.cgstAmount,
        sgst_amount: totals.sgstAmount,
        igst_amount: totals.igstAmount,
        total_gst: totals.totalGst,
        round_off: totals.roundOff,
        grand_total: totals.grandTotal,
        balance_due: totals.grandTotal,
      },
      items,
    });
    navigate("/billing/invoices");
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-3 space-y-3 sm:px-4 sm:py-4 sm:space-y-4 lg:py-6 lg:space-y-6">
      {/* Header - compact on mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold sm:text-2xl">New Invoice</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={createInvoice.isPending}>
            Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave("confirmed")} disabled={createInvoice.isPending || items.length === 0}>
            <Save className="h-4 w-4 mr-1" />
            Confirm
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet: Summary at top, collapsible-style for quick glance */}
      <div className="block lg:hidden">
        <InvoiceSummary items={items} discountPercent={discountPercent} oldGoldAmount={oldGoldAmount}
          isInterstate={isInterstate} onTotalsChange={setTotals} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Customer Card - compact */}
          <Card>
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-6">
              <CustomerSelect value={customer?.id} onSelect={setCustomer} />
              <div className="flex items-center gap-3">
                <Switch id="interstate" checked={isInterstate} onCheckedChange={setIsInterstate} />
                <Label htmlFor="interstate" className="text-xs sm:text-sm">Interstate Sale (IGST)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Items Card */}
          <Card>
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-3 pb-3 sm:px-6 sm:pb-6">
              <ProductSelector onSelect={handleProductSelect} />
              {items.length > 0 && (
                <div className="overflow-x-auto -mx-3 px-3 sm:-mx-6 sm:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Item</TableHead>
                        <TableHead className="text-right text-xs">Metal</TableHead>
                        <TableHead className="text-right text-xs hidden sm:table-cell">Making</TableHead>
                        <TableHead className="text-right text-xs hidden sm:table-cell">Stone</TableHead>
                        <TableHead className="text-right text-xs hidden md:table-cell">Disc %</TableHead>
                        <TableHead className="text-right text-xs">Total</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <InvoiceItemRow key={index} item={item} index={index} isInterstate={isInterstate}
                          onUpdate={handleUpdateItem} onRemove={handleRemoveItem} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details - single column on mobile */}
          <Card>
            <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
              <CardTitle className="text-sm sm:text-base">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">Overall Discount %</Label>
                  <Input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} min={0} max={100} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Old Gold Adjustment (₹)</Label>
                  <Input type="number" value={oldGoldAmount} onChange={(e) => setOldGoldAmount(parseFloat(e.target.value) || 0)} min={0} className="h-9" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs sm:text-sm">Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop: Summary on right side */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <InvoiceSummary items={items} discountPercent={discountPercent} oldGoldAmount={oldGoldAmount}
              isInterstate={isInterstate} onTotalsChange={setTotals} />
          </div>
        </div>
      </div>
    </div>
  );
}
