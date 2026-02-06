import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCreateAppraisal } from "@/hooks/useAppraisals";
import { useRates } from "@/contexts/RateContext";
import { formatCurrency } from "@/lib/formatters";
import { GOLD_PURITY_PERCENTAGES, SILVER_PURITY_PERCENTAGES } from "@/lib/constants";

interface AppraisalItemForm {
  description: string;
  metal_type: string;
  purity: string;
  gross_weight: number;
  stone_weight: number;
  net_weight: number;
  rate_per_gram: number;
  metal_value: number;
  stone_type: string;
  stone_count: number;
  stone_value: number;
  making_charge_value: number;
  total_value: number;
  condition: string;
  hallmark_status: string;
  huid: string;
  notes: string;
}

const emptyItem: AppraisalItemForm = {
  description: "",
  metal_type: "gold",
  purity: "22K",
  gross_weight: 0,
  stone_weight: 0,
  net_weight: 0,
  rate_per_gram: 0,
  metal_value: 0,
  stone_type: "",
  stone_count: 0,
  stone_value: 0,
  making_charge_value: 0,
  total_value: 0,
  condition: "good",
  hallmark_status: "",
  huid: "",
  notes: "",
};

export default function NewAppraisalPage() {
  const navigate = useNavigate();
  const createAppraisal = useCreateAppraisal();
  const { rates } = useRates();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [purpose, setPurpose] = useState("valuation");
  const [appraisedBy, setAppraisedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<AppraisalItemForm[]>([{ ...emptyItem }]);

  const goldRate = rates?.gold_24k_sell || 0;
  const silverRate = rates?.silver_999_sell || 0;

  const getRate = (metalType: string, purity: string) => {
    if (metalType === 'gold') {
      const factor = GOLD_PURITY_PERCENTAGES[purity as keyof typeof GOLD_PURITY_PERCENTAGES] || 1;
      return goldRate * factor;
    }
    if (metalType === 'silver') {
      const factor = SILVER_PURITY_PERCENTAGES[purity as keyof typeof SILVER_PURITY_PERCENTAGES] || 1;
      return silverRate * factor;
    }
    return 0;
  };

  const updateItem = (index: number, field: keyof AppraisalItemForm, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    // Auto-calculate
    const item = updated[index];
    item.net_weight = Math.max(0, item.gross_weight - item.stone_weight);
    item.rate_per_gram = getRate(item.metal_type, item.purity);
    item.metal_value = item.net_weight * item.rate_per_gram;
    item.total_value = item.metal_value + (item.stone_value || 0) + (item.making_charge_value || 0);

    setItems(updated);
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totals = {
    weight: items.reduce((s, i) => s + i.gross_weight, 0),
    metalValue: items.reduce((s, i) => s + i.metal_value, 0),
    stoneValue: items.reduce((s, i) => s + i.stone_value, 0),
    makingValue: items.reduce((s, i) => s + i.making_charge_value, 0),
    grandTotal: items.reduce((s, i) => s + i.total_value, 0),
  };

  const handleSubmit = async () => {
    const validItems = items.filter(i => i.description && i.gross_weight > 0);
    if (validItems.length === 0) return;
    await createAppraisal.mutateAsync({
      customer_name: customerName || undefined,
      customer_phone: customerPhone || undefined,
      purpose,
      appraised_by: appraisedBy || undefined,
      market_rate_gold: goldRate,
      market_rate_silver: silverRate,
      notes: notes || undefined,
      items: validItems.map(i => ({
        ...i,
        item_number: 0,
        wastage_percent: 0,
        stone_carat: 0,
      })) as any,
    });
    navigate("/appraisals");
  };

  const goldPurities = Object.keys(GOLD_PURITY_PERCENTAGES);
  const silverPurities = Object.keys(SILVER_PURITY_PERCENTAGES);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/appraisals")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Appraisal</h1>
          <p className="text-muted-foreground">Create a jewellery valuation report</p>
        </div>
      </div>

      {/* Customer & Purpose */}
      <Card>
        <CardHeader><CardTitle>Customer & Purpose</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label>Customer Name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in customer" />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="valuation">Valuation</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Appraised By</Label>
              <Input value={appraisedBy} onChange={(e) => setAppraisedBy(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <span>Gold 24K Rate: {formatCurrency(goldRate)}/g</span>
            <span>Silver 999 Rate: {formatCurrency(silverRate)}/g</span>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Appraisal Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" />Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.map((item, idx) => (
            <div key={idx} className="space-y-4 p-4 border rounded-lg relative">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Item {idx + 1}</h4>
                {items.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="grid gap-2 md:col-span-2">
                  <Label>Description *</Label>
                  <Input value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Gold Necklace, Bangles, etc." />
                </div>
                <div className="grid gap-2">
                  <Label>Metal Type</Label>
                  <Select value={item.metal_type} onValueChange={(v) => updateItem(idx, 'metal_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Purity</Label>
                  <Select value={item.purity} onValueChange={(v) => updateItem(idx, 'purity', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(item.metal_type === 'gold' ? goldPurities : silverPurities).map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="grid gap-2">
                  <Label>Gross Wt. (g)</Label>
                  <Input type="number" step="0.001" value={item.gross_weight || ""} onChange={(e) => updateItem(idx, 'gross_weight', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="grid gap-2">
                  <Label>Stone Wt. (g)</Label>
                  <Input type="number" step="0.001" value={item.stone_weight || ""} onChange={(e) => updateItem(idx, 'stone_weight', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="grid gap-2">
                  <Label>Net Wt. (g)</Label>
                  <Input value={item.net_weight.toFixed(3)} readOnly className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label>Rate/g (₹)</Label>
                  <Input value={formatCurrency(item.rate_per_gram)} readOnly className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label>Metal Value</Label>
                  <Input value={formatCurrency(item.metal_value)} readOnly className="bg-muted font-semibold" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="grid gap-2">
                  <Label>Stone Value (₹)</Label>
                  <Input type="number" value={item.stone_value || ""} onChange={(e) => updateItem(idx, 'stone_value', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="grid gap-2">
                  <Label>Making Value (₹)</Label>
                  <Input type="number" value={item.making_charge_value || ""} onChange={(e) => updateItem(idx, 'making_charge_value', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="grid gap-2">
                  <Label>Condition</Label>
                  <Select value={item.condition} onValueChange={(v) => updateItem(idx, 'condition', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Hallmark</Label>
                  <Select value={item.hallmark_status} onValueChange={(v) => updateItem(idx, 'hallmark_status', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hallmarked">Hallmarked</SelectItem>
                      <SelectItem value="not_hallmarked">Not Hallmarked</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Total Value</Label>
                  <Input value={formatCurrency(item.total_value)} readOnly className="bg-muted font-bold" />
                </div>
              </div>
              {item.hallmark_status === 'hallmarked' && (
                <div className="grid gap-2 max-w-xs">
                  <Label>HUID</Label>
                  <Input value={item.huid} onChange={(e) => updateItem(idx, 'huid', e.target.value)} />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader><CardTitle>Appraisal Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-bold">{items.filter(i => i.description).length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Weight</p>
              <p className="text-xl font-bold">{totals.weight.toFixed(3)}g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Metal Value</p>
              <p className="text-xl font-bold">{formatCurrency(totals.metalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stone + Making</p>
              <p className="text-xl font-bold">{formatCurrency(totals.stoneValue + totals.makingValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totals.grandTotal)}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes or observations..." />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/appraisals")}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={createAppraisal.isPending} size="lg">
          {createAppraisal.isPending ? "Saving..." : "Create Appraisal"}
        </Button>
      </div>
    </div>
  );
}
