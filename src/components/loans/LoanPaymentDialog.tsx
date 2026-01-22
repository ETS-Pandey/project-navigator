import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLoanPayment } from "@/hooks/useLoans";
import { formatCurrency } from "@/lib/formatters";
import type { Loan } from "@/types/loans";

const paymentSchema = z.object({
  payment_type: z.enum(["interest", "principal", "full_redemption"]),
  amount: z.coerce.number().positive("Amount is required"),
  principal_amount: z.coerce.number().min(0),
  interest_amount: z.coerce.number().min(0),
  payment_mode: z.enum(["cash", "card", "upi", "bank_transfer", "cheque"]),
  reference_number: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface LoanPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
}

export function LoanPaymentDialog({ open, onOpenChange, loan }: LoanPaymentDialogProps) {
  const createPayment = useCreateLoanPayment();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_type: "interest",
      amount: 0,
      principal_amount: 0,
      interest_amount: 0,
      payment_mode: "cash",
      reference_number: "",
    },
  });

  const paymentType = form.watch("payment_type");

  const onSubmit = async (data: PaymentFormValues) => {
    await createPayment.mutateAsync({
      loanId: loan.id,
      formData: {
        payment_type: data.payment_type,
        amount: data.amount,
        principal_amount: data.principal_amount,
        interest_amount: data.interest_amount,
        payment_mode: data.payment_mode,
        reference_number: data.reference_number,
      },
    });
    onOpenChange(false);
    form.reset();
  };

  const handlePaymentTypeChange = (type: string) => {
    form.setValue("payment_type", type as "interest" | "principal" | "full_redemption");
    if (type === "full_redemption") {
      form.setValue("amount", loan.outstanding_total);
      form.setValue("principal_amount", loan.outstanding_principal);
      form.setValue("interest_amount", loan.outstanding_interest);
    } else if (type === "interest") {
      form.setValue("amount", loan.outstanding_interest);
      form.setValue("principal_amount", 0);
      form.setValue("interest_amount", loan.outstanding_interest);
    } else {
      form.setValue("amount", 0);
      form.setValue("principal_amount", 0);
      form.setValue("interest_amount", 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <div className="mb-4 rounded-lg bg-muted p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Outstanding Principal</span>
            <span className="font-medium">{formatCurrency(loan.outstanding_principal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Outstanding Interest</span>
            <span className="font-medium">{formatCurrency(loan.outstanding_interest)}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="font-medium">Total Outstanding</span>
            <span className="font-bold text-primary">{formatCurrency(loan.outstanding_total)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select value={field.value} onValueChange={handlePaymentTypeChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="interest">Interest Only</SelectItem>
                      <SelectItem value="principal">Principal + Interest</SelectItem>
                      <SelectItem value="full_redemption">Full Redemption</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="principal_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Principal</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled={paymentType === "interest"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interest_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={createPayment.isPending}>
                {createPayment.isPending ? "Processing..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
