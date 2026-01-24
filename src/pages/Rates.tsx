import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useRates } from "@/contexts/RateContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calculator, Save, RefreshCw } from "lucide-react";
import { GOLD_PURITY_PERCENTAGES, SILVER_PURITY_PERCENTAGES } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import { RateAlertConfig } from "@/components/rates/RateAlertConfig";
import { useLiveRates } from "@/hooks/useLiveRates";

const rateSchema = z.object({
  gold_24k_buy: z.coerce.number().min(0, "Rate must be positive"),
  gold_24k_sell: z.coerce.number().min(0, "Rate must be positive"),
  gold_22k_buy: z.coerce.number().min(0).optional(),
  gold_22k_sell: z.coerce.number().min(0).optional(),
  gold_18k_buy: z.coerce.number().min(0).optional(),
  gold_18k_sell: z.coerce.number().min(0).optional(),
  gold_14k_buy: z.coerce.number().min(0).optional(),
  gold_14k_sell: z.coerce.number().min(0).optional(),
  silver_999_buy: z.coerce.number().min(0).optional(),
  silver_999_sell: z.coerce.number().min(0).optional(),
  silver_925_buy: z.coerce.number().min(0).optional(),
  silver_925_sell: z.coerce.number().min(0).optional(),
  platinum_buy: z.coerce.number().min(0).optional(),
  platinum_sell: z.coerce.number().min(0).optional(),
  wholesale_discount_percent: z.coerce.number().min(0).max(100).optional(),
});

type RateFormValues = z.infer<typeof rateSchema>;

export default function Rates() {
  const { user } = useAuth();
  const { currentBranch } = useBranch();
  const { rates, latestRates, refreshRates, error: ratesError } = useRates();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);

  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      gold_24k_buy: 0,
      gold_24k_sell: 0,
      gold_22k_buy: 0,
      gold_22k_sell: 0,
      gold_18k_buy: 0,
      gold_18k_sell: 0,
      gold_14k_buy: 0,
      gold_14k_sell: 0,
      silver_999_buy: 0,
      silver_999_sell: 0,
      silver_925_buy: 0,
      silver_925_sell: 0,
      platinum_buy: 0,
      platinum_sell: 0,
      wholesale_discount_percent: 0,
    },
  });

  // Load existing rates - prefer today's rates, fallback to latest rates for pre-fill
  useEffect(() => {
    const rateData = rates || latestRates;
    if (rateData) {
      form.reset({
        gold_24k_buy: rateData.gold_24k_buy,
        gold_24k_sell: rateData.gold_24k_sell,
        gold_22k_buy: rateData.gold_22k_buy || 0,
        gold_22k_sell: rateData.gold_22k_sell || 0,
        gold_18k_buy: rateData.gold_18k_buy || 0,
        gold_18k_sell: rateData.gold_18k_sell || 0,
        gold_14k_buy: rateData.gold_14k_buy || 0,
        gold_14k_sell: rateData.gold_14k_sell || 0,
        silver_999_buy: rateData.silver_999_buy || 0,
        silver_999_sell: rateData.silver_999_sell || 0,
        silver_925_buy: rateData.silver_925_buy || 0,
        silver_925_sell: rateData.silver_925_sell || 0,
        platinum_buy: rateData.platinum_buy || 0,
        platinum_sell: rateData.platinum_sell || 0,
        wholesale_discount_percent: rateData.wholesale_discount_percent,
      });
    }
  }, [rates, latestRates, form]);

  // Auto-calculate lower purities from 24K
  const handleAutoCalculate = () => {
    const gold24kBuy = form.getValues("gold_24k_buy");
    const gold24kSell = form.getValues("gold_24k_sell");

    if (autoCalculate && gold24kBuy > 0) {
      form.setValue("gold_22k_buy", Math.round(gold24kBuy * GOLD_PURITY_PERCENTAGES["22K"]));
      form.setValue("gold_18k_buy", Math.round(gold24kBuy * GOLD_PURITY_PERCENTAGES["18K"]));
      form.setValue("gold_14k_buy", Math.round(gold24kBuy * GOLD_PURITY_PERCENTAGES["14K"]));
    }

    if (autoCalculate && gold24kSell > 0) {
      form.setValue("gold_22k_sell", Math.round(gold24kSell * GOLD_PURITY_PERCENTAGES["22K"]));
      form.setValue("gold_18k_sell", Math.round(gold24kSell * GOLD_PURITY_PERCENTAGES["18K"]));
      form.setValue("gold_14k_sell", Math.round(gold24kSell * GOLD_PURITY_PERCENTAGES["14K"]));
    }

    // Auto-calculate silver 925 from 999
    const silver999Buy = form.getValues("silver_999_buy");
    const silver999Sell = form.getValues("silver_999_sell");

    if (autoCalculate && silver999Buy && silver999Buy > 0) {
      form.setValue("silver_925_buy", Math.round(silver999Buy * SILVER_PURITY_PERCENTAGES["925"]));
    }

    if (autoCalculate && silver999Sell && silver999Sell > 0) {
      form.setValue("silver_925_sell", Math.round(silver999Sell * SILVER_PURITY_PERCENTAGES["925"]));
    }
  };

  const onSubmit = async (data: RateFormValues) => {
    if (!currentBranch || !user) {
      toast({
        title: "Error",
        description: "No branch selected",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const today = new Date().toISOString().split("T")[0];

    try {
      // Check if rates exist for today
      if (rates) {
        // Update existing rates
        const { error } = await supabase
          .from("daily_rates")
          .update({
            ...data,
            set_by: user.id,
          })
          .eq("id", rates.id);

        if (error) throw error;
      } else {
        // Insert new rates
        const { error } = await supabase.from("daily_rates").insert([{
          branch_id: currentBranch.id,
          rate_date: today,
          gold_24k_buy: data.gold_24k_buy,
          gold_24k_sell: data.gold_24k_sell,
          gold_22k_buy: data.gold_22k_buy,
          gold_22k_sell: data.gold_22k_sell,
          gold_18k_buy: data.gold_18k_buy,
          gold_18k_sell: data.gold_18k_sell,
          gold_14k_buy: data.gold_14k_buy,
          gold_14k_sell: data.gold_14k_sell,
          silver_999_buy: data.silver_999_buy,
          silver_999_sell: data.silver_999_sell,
          silver_925_buy: data.silver_925_buy,
          silver_925_sell: data.silver_925_sell,
          platinum_buy: data.platinum_buy,
          platinum_sell: data.platinum_sell,
          wholesale_discount_percent: data.wholesale_discount_percent,
          set_by: user.id,
        }]);

        if (error) throw error;
      }

      toast({
        title: "Rates Updated",
        description: "Today's rates have been saved successfully.",
      });

      refreshRates();
    } catch (error: unknown) {
      console.error("Error saving rates:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save rates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Rate Management</h1>
          <p className="text-muted-foreground">
            Set today's gold, silver, and platinum rates for {currentBranch?.name}
          </p>
          {ratesError && !rates && latestRates && (
            <p className="text-sm text-amber-600 mt-1">
              No rates for today. Pre-filled with rates from {new Date(latestRates.rate_date).toLocaleDateString()}.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={autoCalculate}
            onCheckedChange={setAutoCalculate}
            id="auto-calc"
          />
          <label htmlFor="auto-calc" className="text-sm text-muted-foreground">
            Auto-calculate purities
          </label>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Gold Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Gold Rates (per gram)</CardTitle>
              <CardDescription>
                Enter 24K rate and other purities will be calculated automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* 24K */}
              <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h4 className="font-semibold text-primary">24K (999)</h4>
                <FormField
                  control={form.control}
                  name="gold_24k_buy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setTimeout(handleAutoCalculate, 0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gold_24k_sell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setTimeout(handleAutoCalculate, 0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 22K */}
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">22K (916)</h4>
                <FormField
                  control={form.control}
                  name="gold_22k_buy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={autoCalculate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gold_22k_sell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={autoCalculate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 18K */}
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">18K (750)</h4>
                <FormField
                  control={form.control}
                  name="gold_18k_buy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={autoCalculate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gold_18k_sell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={autoCalculate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 14K */}
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">14K (585)</h4>
                <FormField
                  control={form.control}
                  name="gold_14k_buy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={autoCalculate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gold_14k_sell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={autoCalculate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Silver Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Silver Rates (per gram)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {/* 999 */}
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">999 Pure Silver</h4>
                <FormField
                  control={form.control}
                  name="silver_999_buy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setTimeout(handleAutoCalculate, 0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="silver_999_sell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setTimeout(handleAutoCalculate, 0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 925 */}
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-semibold">925 Sterling Silver</h4>
                <FormField
                  control={form.control}
                  name="silver_925_buy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={autoCalculate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="silver_925_sell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          disabled={autoCalculate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Wholesale Discount */}
          <Card>
            <CardHeader>
              <CardTitle>Wholesale Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="wholesale_discount_percent"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Wholesale Discount %</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" max="100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Discount percentage applied to wholesale customers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Rates
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAutoCalculate}
              disabled={!autoCalculate}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Recalculate
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={refreshRates}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </form>
      </Form>

      {/* Rate Alert Configuration */}
      <RateAlertConfig />
    </div>
  );
}
