import { useState } from "react";
import { format, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { Scheme, EnrollmentFormData } from "@/types/schemes";

interface EnrollmentFormProps {
  schemes: Scheme[];
  customers: Array<{ id: string; name: string; phone?: string; customer_code: string }>;
  onSubmit: (data: EnrollmentFormData) => void;
  isLoading?: boolean;
}

export function EnrollmentForm({ schemes, customers, onSubmit, isLoading }: EnrollmentFormProps) {
  const [schemeId, setSchemeId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const selectedScheme = schemes.find((s) => s.id === schemeId);
  const maturityDate = selectedScheme
    ? addMonths(startDate, selectedScheme.duration_months)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeId || !customerId) return;

    onSubmit({
      scheme_id: schemeId,
      customer_id: customerId,
      start_date: format(startDate, "yyyy-MM-dd"),
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Select Scheme *</Label>
        <Select value={schemeId} onValueChange={setSchemeId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a scheme" />
          </SelectTrigger>
          <SelectContent>
            {schemes.map((scheme) => (
              <SelectItem key={scheme.id} value={scheme.id}>
                <div className="flex items-center justify-between gap-4">
                  <span>{scheme.scheme_name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(scheme.monthly_amount)}/mo × {scheme.duration_months}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedScheme && (
        <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly Amount:</span>
            <span className="font-medium">{formatCurrency(selectedScheme.monthly_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span>{selectedScheme.duration_months} months</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">{formatCurrency(selectedScheme.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bonus:</span>
            <span className="text-green-600">
              {selectedScheme.bonus_type === "fixed" && `+${formatCurrency(selectedScheme.bonus_value)}`}
              {selectedScheme.bonus_type === "percentage" && `+${selectedScheme.bonus_value}%`}
              {selectedScheme.bonus_type === "gold_bonus" && `+${selectedScheme.bonus_value}g gold`}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Select Customer *</Label>
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                <div className="flex items-center gap-2">
                  <span>{customer.name}</span>
                  <span className="text-muted-foreground">({customer.customer_code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Start Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(startDate, "dd MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {maturityDate && (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">Maturity Date:</span>
          <span className="font-medium">{format(maturityDate, "dd MMM yyyy")}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label>Notes (Optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={!schemeId || !customerId || isLoading}>
        {isLoading ? "Enrolling..." : "Enroll Customer"}
      </Button>
    </form>
  );
}
