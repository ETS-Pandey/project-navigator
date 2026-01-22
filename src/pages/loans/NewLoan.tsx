import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addMonths } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  User,
  Package,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerSelect } from "@/components/billing/CustomerSelect";
import { useCreateLoan } from "@/hooks/useLoans";
import { useRates } from "@/contexts/RateContext";
import { formatCurrency, formatWeight } from "@/lib/formatters";
import { GOLD_PURITIES, SILVER_PURITIES } from "@/lib/constants";
import type { Customer } from "@/types/billing";

const collateralSchema = z.object({
  item_description: z.string().min(1, "Item description is required"),
  metal_type: z.enum(["gold", "silver", "platinum"]),
  purity: z.string().min(1, "Purity is required"),
  gross_weight: z.coerce.number().positive("Weight must be positive"),
  stone_weight: z.coerce.number().min(0).default(0),
  rate_per_gram: z.coerce.number().positive("Rate is required"),
  storage_location: z.string().optional(),
  packet_number: z.string().optional(),
});

const loanSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  loan_date: z.string().min(1, "Loan date is required"),
  interest_rate: z.coerce.number().positive("Interest rate is required"),
  interest_type: z.enum(["simple", "compound"]),
  tenure_months: z.coerce.number().int().positive("Tenure is required"),
  ltv_percent: z.coerce.number().min(1).max(100).default(75),
  notes: z.string().optional(),
  collaterals: z.array(collateralSchema).min(1, "At least one collateral is required"),
});

type LoanFormValues = z.infer<typeof loanSchema>;

interface CollateralItem {
  item_description: string;
  metal_type: "gold" | "silver" | "platinum";
  purity: string;
  gross_weight: number;
  stone_weight: number;
  rate_per_gram: number;
  storage_location: string;
  packet_number: string;
}

const DEFAULT_COLLATERAL: CollateralItem = {
  item_description: "",
  metal_type: "gold",
  purity: "22K",
  gross_weight: 0,
  stone_weight: 0,
  rate_per_gram: 0,
  storage_location: "",
  packet_number: "",
};

export default function NewLoan() {
  const navigate = useNavigate();
  const createLoan = useCreateLoan();
  const { getGoldRate, getSilverRate } = useRates();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      customer_id: "",
      loan_date: format(new Date(), "yyyy-MM-dd"),
      interest_rate: 12,
      interest_type: "simple",
      tenure_months: 12,
      ltv_percent: 75,
      notes: "",
      collaterals: [{ ...DEFAULT_COLLATERAL }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "collaterals",
  });

  const watchCollaterals = form.watch("collaterals");
  const watchLtvPercent = form.watch("ltv_percent");
  const watchTenureMonths = form.watch("tenure_months");
  const watchLoanDate = form.watch("loan_date");
  const watchInterestRate = form.watch("interest_rate");
  const watchInterestType = form.watch("interest_type");

  // Calculate totals
  const calculateCollateralValue = (collateral: CollateralItem) => {
    const netWeight = (collateral.gross_weight || 0) - (collateral.stone_weight || 0);
    return netWeight * (collateral.rate_per_gram || 0);
  };

  const totalCollateralValue = watchCollaterals.reduce(
    (sum, c) => sum + calculateCollateralValue(c as CollateralItem),
    0
  );

  const loanAmount = (totalCollateralValue * watchLtvPercent) / 100;
  const dueDate = watchLoanDate
    ? format(addMonths(new Date(watchLoanDate), watchTenureMonths), "dd MMM yyyy")
    : "";

  // Estimate interest
  const estimatedInterest = watchInterestType === 'simple'
    ? (loanAmount * watchInterestRate * watchTenureMonths) / (12 * 100)
    : loanAmount * (Math.pow(1 + watchInterestRate / 12 / 100, watchTenureMonths) - 1);

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    form.setValue("customer_id", customer?.id || "");
  };

  const handleMetalTypeChange = (index: number, metalType: "gold" | "silver" | "platinum") => {
    const defaultPurity = metalType === "gold" ? "22K" : metalType === "silver" ? "925" : "950";
    form.setValue(`collaterals.${index}.purity`, defaultPurity);
    
    // Auto-fill rate based on metal type
    let rate = 0;
    if (metalType === "gold") {
      rate = getGoldRate("22K", "buy") || 0;
    } else if (metalType === "silver") {
      rate = getSilverRate("925", "buy") || 0;
    }
    form.setValue(`collaterals.${index}.rate_per_gram`, rate);
  };

  const handlePurityChange = (index: number, purity: string) => {
    const metalType = watchCollaterals[index].metal_type;
    let rate = 0;
    if (metalType === "gold" && ["24K", "22K", "18K", "14K"].includes(purity)) {
      rate = getGoldRate(purity as "24K" | "22K" | "18K" | "14K", "buy") || 0;
    } else if (metalType === "silver" && ["999", "925"].includes(purity)) {
      rate = getSilverRate(purity as "999" | "925", "buy") || 0;
    }
    form.setValue(`collaterals.${index}.rate_per_gram`, rate);
  };

  const onSubmit = async (data: LoanFormValues) => {
    try {
      const loan = await createLoan.mutateAsync({
        customer_id: data.customer_id,
        loan_date: data.loan_date,
        interest_rate: data.interest_rate,
        interest_type: data.interest_type,
        tenure_months: data.tenure_months,
        notes: data.notes,
        collaterals: data.collaterals.map(c => ({
          item_description: c.item_description,
          metal_type: c.metal_type,
          purity: c.purity,
          gross_weight: c.gross_weight,
          stone_weight: c.stone_weight,
          rate_per_gram: c.rate_per_gram,
          storage_location: c.storage_location,
          packet_number: c.packet_number,
        })),
      });
      navigate(`/loans/${loan.id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/loans/active")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Gold Loan</h1>
          <p className="text-sm text-muted-foreground">
            Create a new gold loan account
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Customer Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer *</FormLabel>
                        <FormControl>
                          <CustomerSelect
                            value={field.value}
                            onSelect={handleCustomerSelect}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedCustomer && (
                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-muted-foreground">
                        {selectedCustomer.phone} • {selectedCustomer.customer_code}
                      </p>
                      {selectedCustomer.address && (
                        <p className="text-muted-foreground mt-1">{selectedCustomer.address}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loan Terms */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5" />
                    Loan Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="loan_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interest_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate (% p.a.) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interest_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="simple">Simple Interest</SelectItem>
                              <SelectItem value="compound">Compound Interest</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenure_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tenure (Months) *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ltv_percent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LTV Ratio (%) *</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Collaterals */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5" />
                      Collateral Items
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ ...DEFAULT_COLLATERAL })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => {
                    const collateral = watchCollaterals[index] as CollateralItem;
                    const netWeight = (collateral?.gross_weight || 0) - (collateral?.stone_weight || 0);
                    const itemValue = calculateCollateralValue(collateral);

                    return (
                      <div
                        key={field.id}
                        className="rounded-lg border bg-muted/30 p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Item {index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <FormField
                            control={form.control}
                            name={`collaterals.${index}.item_description`}
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Description *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Gold Chain 22K"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`collaterals.${index}.metal_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Metal Type *</FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={(v) => {
                                    field.onChange(v);
                                    handleMetalTypeChange(index, v as "gold" | "silver" | "platinum");
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="gold">Gold</SelectItem>
                                    <SelectItem value="silver">Silver</SelectItem>
                                    <SelectItem value="platinum">Platinum</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`collaterals.${index}.purity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Purity *</FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={(v) => {
                                    field.onChange(v);
                                    handlePurityChange(index, v);
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {collateral?.metal_type === "gold"
                                      ? GOLD_PURITIES.map((p) => (
                                          <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                          </SelectItem>
                                        ))
                                      : SILVER_PURITIES.map((p) => (
                                          <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`collaterals.${index}.gross_weight`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gross Weight (g) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`collaterals.${index}.stone_weight`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stone Weight (g)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`collaterals.${index}.rate_per_gram`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rate/gram (₹) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`collaterals.${index}.packet_number`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Packet/Tag No.</FormLabel>
                                <FormControl>
                                  <Input placeholder="PKT-001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Item Summary */}
                        <div className="flex items-center justify-between rounded-md bg-background p-3 text-sm">
                          <span className="text-muted-foreground">
                            Net Weight: {formatWeight(netWeight)}
                          </span>
                          <span className="font-medium">
                            Value: {formatCurrency(itemValue)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes about the loan..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IndianRupee className="h-5 w-5" />
                    Loan Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Collateral Value</span>
                      <span className="font-medium">{formatCurrency(totalCollateralValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">LTV Ratio</span>
                      <span className="font-medium">{watchLtvPercent}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Interest Rate</span>
                      <span className="font-medium">{watchInterestRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Interest Type</span>
                      <span className="font-medium capitalize">{watchInterestType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tenure</span>
                      <span className="font-medium">{watchTenureMonths} months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium">{dueDate}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Interest</span>
                      <span className="font-medium text-orange-600">
                        {formatCurrency(estimatedInterest)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Loan Amount</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(loanAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createLoan.isPending}
                    >
                      {createLoan.isPending ? "Creating..." : "Create Loan"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/loans/active")}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
