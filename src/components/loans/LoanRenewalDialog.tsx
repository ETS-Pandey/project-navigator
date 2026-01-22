import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addMonths } from "date-fns";
import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";
import { useRenewLoan } from "@/hooks/useLoans";
import type { Loan } from "@/types/loans";

const renewalSchema = z.object({
  new_interest_rate: z.number().min(0.1).max(36),
  new_tenure_months: z.number().min(1).max(36),
  interest_type: z.enum(["simple", "compound"]),
  renewal_fee: z.number().min(0),
  notes: z.string().optional(),
});

type RenewalFormData = z.infer<typeof renewalSchema>;

interface LoanRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
}

export function LoanRenewalDialog({ open, onOpenChange, loan }: LoanRenewalDialogProps) {
  const renewLoan = useRenewLoan();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RenewalFormData>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      new_interest_rate: loan.interest_rate,
      new_tenure_months: loan.tenure_months,
      interest_type: loan.interest_type as "simple" | "compound",
      renewal_fee: 0,
      notes: "",
    },
  });

  const newTenure = watch("new_tenure_months");
  const renewalFee = watch("renewal_fee");

  // Calculate new due date
  const newDueDate = addMonths(new Date(), newTenure || 12);

  // New principal = outstanding total + renewal fee
  const newPrincipal = loan.outstanding_total + (renewalFee || 0);

  const onSubmit = async (data: RenewalFormData) => {
    setIsSubmitting(true);
    try {
      await renewLoan.mutateAsync({
        loanId: loan.id,
        formData: {
          new_interest_rate: data.new_interest_rate,
          new_tenure_months: data.new_tenure_months,
          interest_type: data.interest_type,
          renewal_fee: data.renewal_fee,
          notes: data.notes,
        },
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Renew Loan
          </DialogTitle>
          <DialogDescription>
            Extend the loan with new terms. The outstanding balance will become the principal of the renewed loan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Loan Summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">Current Loan: {loan.loan_number}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Outstanding Principal:</span>
                <span className="ml-2 font-medium">{formatCurrency(loan.outstanding_principal)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Outstanding Interest:</span>
                <span className="ml-2 font-medium">{formatCurrency(loan.outstanding_interest)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Total Outstanding:</span>
                <span className="ml-2 font-semibold text-orange-600">{formatCurrency(loan.outstanding_total)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* New Terms */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new_interest_rate">New Interest Rate (% p.a.)</Label>
              <Input
                id="new_interest_rate"
                type="number"
                step="0.1"
                {...register("new_interest_rate", { valueAsNumber: true })}
              />
              {errors.new_interest_rate && (
                <p className="text-sm text-destructive">{errors.new_interest_rate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_tenure_months">New Tenure (Months)</Label>
              <Input
                id="new_tenure_months"
                type="number"
                min={1}
                max={36}
                {...register("new_tenure_months", { valueAsNumber: true })}
              />
              {errors.new_tenure_months && (
                <p className="text-sm text-destructive">{errors.new_tenure_months.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest_type">Interest Type</Label>
              <Select
                value={watch("interest_type")}
                onValueChange={(v) => setValue("interest_type", v as "simple" | "compound")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Interest</SelectItem>
                  <SelectItem value="compound">Compound Interest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewal_fee">Renewal Fee</Label>
              <Input
                id="renewal_fee"
                type="number"
                step="0.01"
                {...register("renewal_fee", { valueAsNumber: true })}
              />
              {errors.renewal_fee && (
                <p className="text-sm text-destructive">{errors.renewal_fee.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Reason for renewal, special terms..."
              {...register("notes")}
            />
          </div>

          <Separator />

          {/* New Loan Preview */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <p className="text-sm font-medium text-primary">New Loan Preview</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">New Principal:</span>
                <span className="ml-2 font-semibold">{formatCurrency(newPrincipal)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">New Due Date:</span>
                <span className="ml-2 font-medium">{format(newDueDate, "dd MMM yyyy")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Collateral Value:</span>
                <span className="ml-2 font-medium">{formatCurrency(loan.collateral_value)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">New LTV:</span>
                <span className="ml-2 font-medium">
                  {((newPrincipal / loan.collateral_value) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Renew Loan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
