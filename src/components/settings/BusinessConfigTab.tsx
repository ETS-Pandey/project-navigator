import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { useBusinessSettings, useUpsertBusinessSettings } from "@/hooks/useSettings";

const businessConfigSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  tagline: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankIfsc: z.string().optional(),
  upiId: z.string().optional(),
  defaultTaxRate: z.string().optional(),
  currency: z.string().default("INR"),
  fiscalYearStart: z.string().default("04"),
  enableLoyaltyPoints: z.boolean().default(false),
  pointsPerRupee: z.string().optional(),
  enableSmsNotifications: z.boolean().default(false),
  enableEmailNotifications: z.boolean().default(false),
});

type BusinessConfigForm = z.infer<typeof businessConfigSchema>;

export function BusinessConfigTab() {
  const { data: settings, isLoading } = useBusinessSettings("business_config");
  const upsertSettings = useUpsertBusinessSettings();

  const form = useForm<BusinessConfigForm>({
    resolver: zodResolver(businessConfigSchema),
    defaultValues: {
      businessName: "",
      tagline: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      gstNumber: "",
      panNumber: "",
      bankName: "",
      bankAccountNo: "",
      bankIfsc: "",
      upiId: "",
      defaultTaxRate: "3",
      currency: "INR",
      fiscalYearStart: "04",
      enableLoyaltyPoints: false,
      pointsPerRupee: "100",
      enableSmsNotifications: false,
      enableEmailNotifications: false,
    },
  });

  useEffect(() => {
    if (settings?.setting_value) {
      const values = settings.setting_value as Record<string, unknown>;
      form.reset({
        businessName: (values.businessName as string) || "",
        tagline: (values.tagline as string) || "",
        email: (values.email as string) || "",
        phone: (values.phone as string) || "",
        website: (values.website as string) || "",
        address: (values.address as string) || "",
        gstNumber: (values.gstNumber as string) || "",
        panNumber: (values.panNumber as string) || "",
        bankName: (values.bankName as string) || "",
        bankAccountNo: (values.bankAccountNo as string) || "",
        bankIfsc: (values.bankIfsc as string) || "",
        upiId: (values.upiId as string) || "",
        defaultTaxRate: (values.defaultTaxRate as string) || "3",
        currency: (values.currency as string) || "INR",
        fiscalYearStart: (values.fiscalYearStart as string) || "04",
        enableLoyaltyPoints: (values.enableLoyaltyPoints as boolean) || false,
        pointsPerRupee: (values.pointsPerRupee as string) || "100",
        enableSmsNotifications: (values.enableSmsNotifications as boolean) || false,
        enableEmailNotifications: (values.enableEmailNotifications as boolean) || false,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: BusinessConfigForm) => {
    upsertSettings.mutate({
      setting_key: "business_config",
      setting_value: data as unknown as Record<string, unknown>,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Identity */}
        <Card>
          <CardHeader>
            <CardTitle>Business Identity</CardTitle>
            <CardDescription>Basic information about your business</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="JewelPro Jewellers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input placeholder="Trusted since 1990" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@jewelpro.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.jewelpro.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Main Street, City, State - 123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax & Legal */}
        <Card>
          <CardHeader>
            <CardTitle>Tax & Legal</CardTitle>
            <CardDescription>Tax registration and legal details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="gstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl>
                    <Input placeholder="22AAAAA0000A1Z5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="panNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number</FormLabel>
                  <FormControl>
                    <Input placeholder="AAAAA0000A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultTaxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default GST Rate (%)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">0% (Exempt)</SelectItem>
                      <SelectItem value="3">3% (Gold/Silver)</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fiscalYearStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiscal Year Start Month</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="01">January</SelectItem>
                      <SelectItem value="04">April</SelectItem>
                      <SelectItem value="07">July</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
            <CardDescription>Payment and banking information for invoices</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="State Bank of India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankAccountNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankIfsc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SBIN0001234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input placeholder="jewelpro@upi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Enable or disable optional features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="enableLoyaltyPoints"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Loyalty Points</FormLabel>
                    <FormDescription>
                      Award points to customers on purchases
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.watch("enableLoyaltyPoints") && (
              <FormField
                control={form.control}
                name="pointsPerRupee"
                render={({ field }) => (
                  <FormItem className="ml-4">
                    <FormLabel>Points per ₹100 spent</FormLabel>
                    <FormControl>
                      <Input type="number" className="max-w-[200px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="enableSmsNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">SMS Notifications</FormLabel>
                    <FormDescription>
                      Send SMS alerts for invoices, payments, and reminders
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enableEmailNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Email Notifications</FormLabel>
                    <FormDescription>
                      Send email alerts for invoices and reports
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={upsertSettings.isPending}>
            {upsertSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
