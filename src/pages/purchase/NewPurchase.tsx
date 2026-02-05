import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendors } from "@/hooks/useVendors";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { useRates } from "@/contexts/RateContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

interface PurchaseItem {
  id: string;
  item_description: string;
  hsn_code: string;
  metal_type: string;
  purity: string;
  gross_weight: number;
  net_weight: number;
  rate_per_gram: number;
  quantity: number;
  unit_price: number;
  gst_percent: number;
  total: number;
}

const purchaseTypes = [
  { value: "bullion", label: "Bullion" },
  { value: "finished", label: "Finished Goods" },
  { value: "stones", label: "Stones" },
  { value: "consumables", label: "Consumables" },
  { value: "other", label: "Other" },
];

export default function NewPurchase() {
  const navigate = useNavigate();
  const { data: vendors = [] } = useVendors();
  const { rates } = useRates();
  const createPurchase = useCreatePurchase();
  
  const [formData, setFormData] = useState({
    vendor_id: "",
    purchase_type: "bullion",
    purchase_date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    invoice_date: "",
    is_interstate: false,
    notes: "",
  });
  
  const [items, setItems] = useState<PurchaseItem[]>([]);
  
  const addItem = () => {
    const newItem: PurchaseItem = {
      id: crypto.randomUUID(),
      item_description: "",
      hsn_code: "7108",
      metal_type: "gold",
      purity: "24K",
      gross_weight: 0,
      net_weight: 0,
      rate_per_gram: rates?.gold_24k_buy || 0,
      quantity: 1,
      unit_price: 0,
      gst_percent: 3,
      total: 0,
    };
    setItems([...items, newItem]);
  };
  
  const updateItem = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // Recalculate total
      if (["net_weight", "rate_per_gram", "quantity", "unit_price", "gst_percent"].includes(field)) {
        let baseValue = 0;
        
        if (formData.purchase_type === "bullion") {
          baseValue = Number(updated.net_weight) * Number(updated.rate_per_gram);
        } else {
          baseValue = Number(updated.quantity) * Number(updated.unit_price);
        }
        
        const gst = (baseValue * Number(updated.gst_percent)) / 100;
        updated.total = baseValue + gst;
        updated.unit_price = baseValue;
      }
      
      return updated;
    }));
  };
  
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };
  
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalGst = items.reduce((sum, item) => sum + (item.unit_price * item.gst_percent) / 100, 0);
  
  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    
    try {
      await createPurchase.mutateAsync({
        ...formData,
        vendor_id: formData.vendor_id || undefined,
        items: items.map((item) => ({
          item_description: item.item_description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          hsn_code: item.hsn_code,
          metal_type: item.metal_type,
          purity: item.purity,
          gross_weight: item.gross_weight,
          net_weight: item.net_weight,
          rate_per_gram: item.rate_per_gram,
          gst_percent: item.gst_percent,
        })),
      });
      navigate("/purchase/list");
    } catch (error) {
      // Error handled by hook
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Purchase</h1>
          <p className="text-muted-foreground">Record a new purchase entry</p>
        </div>
      </div>
      
      {/* Purchase Details */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Vendor</Label>
              <Select value={formData.vendor_id} onValueChange={(v) => setFormData({ ...formData, vendor_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name} ({vendor.vendor_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Purchase Type</Label>
              <Select value={formData.purchase_type} onValueChange={(v) => setFormData({ ...formData, purchase_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {purchaseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Purchase Date</Label>
              <Input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Invoice Number</Label>
              <Input
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="Vendor invoice #"
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
              />
            </div>
            
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="interstate"
                checked={formData.is_interstate}
                onCheckedChange={(checked) => setFormData({ ...formData, is_interstate: !!checked })}
              />
              <Label htmlFor="interstate">Interstate Purchase (IGST)</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items added. Click "Add Item" to start.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Description</TableHead>
                  {formData.purchase_type === "bullion" ? (
                    <>
                      <TableHead>Purity</TableHead>
                      <TableHead>Gross Wt</TableHead>
                      <TableHead>Net Wt</TableHead>
                      <TableHead>Rate/g</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                    </>
                  )}
                  <TableHead>GST %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.item_description}
                        onChange={(e) => updateItem(item.id, "item_description", e.target.value)}
                        placeholder="Item description"
                      />
                    </TableCell>
                    {formData.purchase_type === "bullion" ? (
                      <>
                        <TableCell>
                          <Select value={item.purity} onValueChange={(v) => updateItem(item.id, "purity", v)}>
                            <SelectTrigger className="w-[80px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24K">24K</SelectItem>
                              <SelectItem value="22K">22K</SelectItem>
                              <SelectItem value="18K">18K</SelectItem>
                              <SelectItem value="999">999</SelectItem>
                              <SelectItem value="925">925</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.001"
                            className="w-[80px]"
                            value={item.gross_weight || ""}
                            onChange={(e) => updateItem(item.id, "gross_weight", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.001"
                            className="w-[80px]"
                            value={item.net_weight || ""}
                            onChange={(e) => updateItem(item.id, "net_weight", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-[100px]"
                            value={item.rate_per_gram || ""}
                            onChange={(e) => updateItem(item.id, "rate_per_gram", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-[80px]"
                            value={item.quantity || ""}
                            onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-[100px]"
                            value={item.unit_price || ""}
                            onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Input
                        type="number"
                        className="w-[60px]"
                        value={item.gst_percent || ""}
                        onChange={(e) => updateItem(item.id, "gst_percent", parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Summary & Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(grandTotal - totalGst)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>{formatCurrency(totalGst)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
            
            <div className="pt-4 space-y-2">
              <Button className="w-full" onClick={handleSubmit} disabled={createPurchase.isPending}>
                {createPurchase.isPending ? "Saving..." : "Save Purchase"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
