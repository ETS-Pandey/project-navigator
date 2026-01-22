import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator } from "lucide-react";
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
import { useRates } from "@/contexts/RateContext";
import { GOLD_PURITIES, SILVER_PURITIES } from "@/lib/constants";
import { calculateOldGoldValue } from "@/lib/calculations";
import { formatCurrency, formatWeight } from "@/lib/formatters";
import { CustomerSelect } from "./CustomerSelect";
import type { OldGoldFormData, Customer } from "@/types/billing";

const oldGoldSchema = z.object({
  customer_id: z.string().optional(),
  metal_type: z.enum(["gold", "silver"]),
  purity: z.string().min(1, "Select purity"),
  gross_weight: z.coerce.number().positive("Weight must be positive"),
  deduction_percent: z.coerce.number().min(0).max(100),
  rate_per_gram: z.coerce.number().positive("Rate must be positive"),
  testing_method: z.enum(["touchstone", "electronic", "fire_assay", "xrf"]).optional(),
  notes: z.string().optional(),
});

interface OldGoldFormProps {
  onSubmit: (data: OldGoldFormData) => void;
  isLoading?: boolean;
}

export function OldGoldForm({ onSubmit, isLoading }: OldGoldFormProps) {
  const { getGoldRate, getSilverRate } = useRates();
  
  const form = useForm<OldGoldFormData>({
    resolver: zodResolver(oldGoldSchema),
    defaultValues: {
      metal_type: "gold",
      purity: "22K",
      gross_weight: 0,
      deduction_percent: 0,
      rate_per_gram: getGoldRate("22K", "buy") || 0,
      testing_method: undefined,
      notes: "",
    },
  });
  
  const metalType = form.watch("metal_type");
  const purity = form.watch("purity");
  const grossWeight = form.watch("gross_weight");
  const deductionPercent = form.watch("deduction_percent");
  const ratePerGram = form.watch("rate_per_gram");
  
  // Update rate when metal type or purity changes
  useEffect(() => {
    if (metalType === "gold") {
      const rate = getGoldRate(purity as "24K" | "22K" | "18K" | "14K", "buy");
      if (rate) form.setValue("rate_per_gram", rate);
    } else {
      const rate = getSilverRate(purity as "999" | "925", "buy");
      if (rate) form.setValue("rate_per_gram", rate);
    }
  }, [metalType, purity, getGoldRate, getSilverRate, form]);
  
  // Reset purity when metal type changes
  useEffect(() => {
    if (metalType === "gold") {
      form.setValue("purity", "22K");
    } else {
      form.setValue("purity", "999");
    }
  }, [metalType, form]);
  
  // Calculate values
  const deductionWeight = grossWeight * (deductionPercent / 100);
  const netWeight = grossWeight - deductionWeight;
  const grossValue = grossWeight * ratePerGram;
  const deductionAmount = grossValue * (deductionPercent / 100);
  const netValue = grossValue - deductionAmount;
  
  const handleCustomerSelect = (customer: Customer | null) => {
    form.setValue("customer_id", customer?.id || undefined);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Old Gold Purchase Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormItem>
              <FormLabel>Customer (Optional)</FormLabel>
              <CustomerSelect
                value={form.watch("customer_id")}
                onSelect={handleCustomerSelect}
              />
            </FormItem>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metal_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metal Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metalType === "gold"
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
                name="gross_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deduction_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deduction %</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rate_per_gram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per Gram (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="testing_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testing Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="touchstone">Touchstone</SelectItem>
                        <SelectItem value="electronic">Electronic Tester</SelectItem>
                        <SelectItem value="xrf">XRF Machine</SelectItem>
                        <SelectItem value="fire_assay">Fire Assay</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Valuation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Gross Weight</div>
                <div className="text-lg font-bold">{formatWeight(grossWeight)}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Deduction</div>
                <div className="text-lg font-bold text-destructive">
                  -{formatWeight(deductionWeight)}
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Net Weight</div>
                <div className="text-lg font-bold">{formatWeight(netWeight)}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Rate/g</div>
                <div className="text-lg font-bold">{formatCurrency(ratePerGram)}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span>Gross Value:</span>
                <span className="font-medium">{formatCurrency(grossValue)}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Deduction ({deductionPercent}%):</span>
                <span>-{formatCurrency(deductionAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Net Value Payable:</span>
                <span className="text-primary">{formatCurrency(netValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading || netValue <= 0}>
            {isLoading ? "Saving..." : "Record Purchase"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
