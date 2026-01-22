import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import type { SchemePaymentFormData, PaymentMode } from "@/types/schemes";

interface SchemePaymentFormProps {
  amount: number;
  onSubmit: (data: SchemePaymentFormData) => void;
  isLoading?: boolean;
}

export function SchemePaymentForm({ amount, onSubmit, isLoading }: SchemePaymentFormProps) {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [upiId, setUpiId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      amount,
      payment_mode: paymentMode,
      reference_number: referenceNumber || undefined,
      bank_name: bankName || undefined,
      cheque_number: chequeNumber || undefined,
      cheque_date: chequeDate || undefined,
      upi_id: upiId || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">Amount Due</p>
        <p className="text-3xl font-bold">{formatCurrency(amount)}</p>
      </div>

      <div className="space-y-2">
        <Label>Payment Mode *</Label>
        <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMode === "upi" && (
        <div className="space-y-2">
          <Label>UPI ID / Transaction Ref</Label>
          <Input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g., user@upi or transaction ID"
          />
        </div>
      )}

      {paymentMode === "card" && (
        <div className="space-y-2">
          <Label>Transaction Reference</Label>
          <Input
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Card transaction reference"
          />
        </div>
      )}

      {paymentMode === "bank_transfer" && (
        <>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Bank name"
            />
          </div>
          <div className="space-y-2">
            <Label>Reference Number</Label>
            <Input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Transaction reference"
            />
          </div>
        </>
      )}

      {paymentMode === "cheque" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cheque Number</Label>
              <Input
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                placeholder="Cheque number"
              />
            </div>
            <div className="space-y-2">
              <Label>Cheque Date</Label>
              <Input
                type="date"
                value={chequeDate}
                onChange={(e) => setChequeDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Bank name"
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Notes (Optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any remarks..."
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Recording..." : `Record Payment of ${formatCurrency(amount)}`}
      </Button>
    </form>
  );
}
