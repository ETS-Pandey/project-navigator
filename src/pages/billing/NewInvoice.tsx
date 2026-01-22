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
        ...totals,
        balance_due: totals.grandTotal,
      },
      items,
    });
    navigate("/billing/invoices");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">New Invoice</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={createInvoice.isPending}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSave("confirmed")} disabled={createInvoice.isPending || items.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Confirm Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <CustomerSelect value={customer?.id} onSelect={setCustomer} />
              <div className="flex items-center gap-4">
                <Switch id="interstate" checked={isInterstate} onCheckedChange={setIsInterstate} />
                <Label htmlFor="interstate">Interstate Sale (IGST)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ProductSelector onSelect={handleProductSelect} />
              {items.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Metal</TableHead>
                        <TableHead className="text-right">Making</TableHead>
                        <TableHead className="text-right">Stone</TableHead>
                        <TableHead className="text-right">Disc %</TableHead>
                        <TableHead className="text-right">Taxable</TableHead>
                        <TableHead className="text-right">GST</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
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

          <Card>
            <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Overall Discount %</Label>
                <Input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} min={0} max={100} />
              </div>
              <div>
                <Label>Old Gold Adjustment (₹)</Label>
                <Input type="number" value={oldGoldAmount} onChange={(e) => setOldGoldAmount(parseFloat(e.target.value) || 0)} min={0} />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <InvoiceSummary items={items} discountPercent={discountPercent} oldGoldAmount={oldGoldAmount}
            isInterstate={isInterstate} onTotalsChange={setTotals} />
        </div>
      </div>
    </div>
  );
}
