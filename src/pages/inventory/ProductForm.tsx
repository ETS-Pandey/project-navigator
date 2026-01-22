import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Calculator } from "lucide-react";
import { useCategories, useSubCategories } from "@/hooks/useCategories";
import { useCreateProduct, useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useRates } from "@/contexts/RateContext";
import { useBranch } from "@/contexts/BranchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";
import { calculateMetalValue, calculateMakingCharges, calculateGST } from "@/lib/calculations";
import { GOLD_PURITIES, SILVER_PURITIES, METAL_COLORS, MAKING_CHARGE_TYPES } from "@/lib/constants";
import type { MetalType, MetalColor, MakingChargeType } from "@/types/inventory";

const productSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  sub_category_id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
  metal_type: z.enum(["gold", "silver", "platinum", "palladium"]),
  purity: z.string().min(1, "Purity is required"),
  metal_color: z.enum(["yellow", "white", "rose", "two_tone", "tri_tone"]),
  gross_weight: z.coerce.number().min(0.001, "Gross weight is required"),
  stone_weight: z.coerce.number().min(0).default(0),
  wastage_percent: z.coerce.number().min(0).max(100).default(0),
  making_charge_type: z.enum(["per_gram", "percentage", "flat"]),
  making_charge_value: z.coerce.number().min(0).default(0),
  has_stones: z.boolean().default(false),
  stone_value: z.coerce.number().min(0).default(0),
  huid: z.string().optional(),
  hallmark_center: z.string().optional(),
  is_hallmarked: z.boolean().default(false),
  location: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { currentBranch } = useBranch();
  const { rates } = useRates();
  const { data: categories } = useCategories();
  const { data: product, isLoading: productLoading } = useProduct(id || "");
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category_id: "",
      sub_category_id: "",
      name: "",
      description: "",
      metal_type: "gold",
      purity: "22K",
      metal_color: "yellow",
      gross_weight: 0,
      stone_weight: 0,
      wastage_percent: 0,
      making_charge_type: "per_gram",
      making_charge_value: 0,
      has_stones: false,
      stone_value: 0,
      huid: "",
      hallmark_center: "",
      is_hallmarked: false,
      location: "",
    },
  });

  const watchedCategoryId = form.watch("category_id");
  const watchedMetalType = form.watch("metal_type");
  const watchedPurity = form.watch("purity");
  const watchedGrossWeight = form.watch("gross_weight");
  const watchedStoneWeight = form.watch("stone_weight");
  const watchedWastagePercent = form.watch("wastage_percent");
  const watchedMakingChargeType = form.watch("making_charge_type");
  const watchedMakingChargeValue = form.watch("making_charge_value");
  const watchedStoneValue = form.watch("stone_value");

  const { data: subCategories } = useSubCategories(watchedCategoryId);

  // Load product data for editing
  useEffect(() => {
    if (product && isEditing) {
      form.reset({
        category_id: product.category_id,
        sub_category_id: product.sub_category_id || "",
        name: product.name,
        description: product.description || "",
        metal_type: product.metal_type,
        purity: product.purity,
        metal_color: product.metal_color,
        gross_weight: product.gross_weight,
        stone_weight: product.stone_weight,
        wastage_percent: product.wastage_percent,
        making_charge_type: product.making_charge_type,
        making_charge_value: product.making_charge_value,
        has_stones: product.has_stones,
        stone_value: product.stone_value,
        huid: product.huid || "",
        hallmark_center: product.hallmark_center || "",
        is_hallmarked: product.is_hallmarked,
        location: product.location || "",
      });
    }
  }, [product, isEditing, form]);

  // Calculate derived values
  const netWeight = Math.max(0, watchedGrossWeight - watchedStoneWeight);
  const wastageWeight = (netWeight * watchedWastagePercent) / 100;
  const totalWeight = netWeight + wastageWeight;

  // Get current rate based on metal type and purity
  const getRate = () => {
    if (!rates) return 0;
    if (watchedMetalType === "gold") {
      const purityKey = `gold_${watchedPurity.toLowerCase().replace("k", "k")}_sell` as keyof typeof rates;
      return (rates[purityKey] as number) || 0;
    } else if (watchedMetalType === "silver") {
      const purityKey = `silver_${watchedPurity}_sell` as keyof typeof rates;
      return (rates[purityKey] as number) || 0;
    }
    return rates.platinum_sell || 0;
  };

  const currentRate = getRate();
  const metalValue = calculateMetalValue(totalWeight, currentRate);
  const makingChargeAmount = calculateMakingCharges(
    totalWeight,
    metalValue,
    watchedMakingChargeType as MakingChargeType,
    watchedMakingChargeValue
  );
  const subtotal = metalValue + makingChargeAmount + (watchedStoneValue || 0);
  const gst = calculateGST(subtotal, false);
  const totalCost = subtotal + gst.cgst + gst.sgst;

  const onSubmit = async (data: ProductFormValues) => {
    const productData = {
      category_id: data.category_id,
      sub_category_id: data.sub_category_id,
      name: data.name,
      description: data.description,
      metal_type: data.metal_type,
      purity: data.purity,
      metal_color: data.metal_color,
      gross_weight: data.gross_weight,
      stone_weight: data.stone_weight,
      wastage_percent: data.wastage_percent,
      making_charge_type: data.making_charge_type,
      making_charge_value: data.making_charge_value,
      has_stones: data.has_stones,
      stone_value: data.stone_value,
      huid: data.huid,
      hallmark_center: data.hallmark_center,
      is_hallmarked: data.is_hallmarked,
      location: data.location,
      net_weight: netWeight,
      wastage_weight: wastageWeight,
      metal_value: metalValue,
      making_charge_amount: makingChargeAmount,
      total_cost: totalCost,
      stone_count: data.has_stones ? 1 : 0,
    };

    if (isEditing && id) {
      await updateProduct.mutateAsync({ id, ...productData });
    } else {
      await createProduct.mutateAsync(productData);
    }
    navigate("/inventory/products");
  };

  const purities = watchedMetalType === "gold" ? GOLD_PURITIES : 
                   watchedMetalType === "silver" ? SILVER_PURITIES : 
                   [{ value: "950", label: "950 (95%)" }];

  if (isEditing && productLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update product details" : "Add a new product to your inventory"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sub_category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subCategories?.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 22K Gold Ring with Diamond" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Product description..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Shelf A, Tray 3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Metal Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Metal Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="metal_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metal Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    name="purity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purity *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {purities.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metal_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {METAL_COLORS.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Weight Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Weight Details (in grams)</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="gross_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Weight *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stone_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stone Weight</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Net Weight</FormLabel>
                    <Input value={netWeight.toFixed(3)} disabled className="bg-muted" />
                    <FormDescription>Gross - Stone</FormDescription>
                  </div>

                  <FormField
                    control={form.control}
                    name="wastage_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wastage %</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>{wastageWeight.toFixed(3)}g</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Making Charges */}
              <Card>
                <CardHeader>
                  <CardTitle>Making Charges</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="making_charge_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charge Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MAKING_CHARGE_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="making_charge_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Value {watchedMakingChargeType === "per_gram" ? "(₹/gram)" : 
                                 watchedMakingChargeType === "percentage" ? "(%)" : "(₹)"}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>Amount: {formatCurrency(makingChargeAmount)}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Stone Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Stone Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="has_stones"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Has Stones</FormLabel>
                      </FormItem>
                    )}
                  />

                  {form.watch("has_stones") && (
                    <FormField
                      control={form.control}
                      name="stone_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stone Value (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Hallmark Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Hallmark / HUID Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="is_hallmarked"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Hallmarked</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="huid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HUID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="6-char HUID" maxLength={6} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hallmark_center"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hallmark Center</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Center name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Price Summary */}
            <div className="space-y-6">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Price Calculation
                  </CardTitle>
                  <CardDescription>Based on today's rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Rate ({watchedPurity})</span>
                      <span className="font-medium">{formatCurrency(currentRate)}/g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Weight</span>
                      <span className="font-medium">{totalWeight.toFixed(3)}g</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metal Value</span>
                      <span className="font-medium">{formatCurrency(metalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Making Charges</span>
                      <span className="font-medium">{formatCurrency(makingChargeAmount)}</span>
                    </div>
                    {watchedStoneValue > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stone Value</span>
                        <span className="font-medium">{formatCurrency(watchedStoneValue)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (3%)</span>
                      <span className="font-medium">{formatCurrency(gst.cgst + gst.sgst)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Cost</span>
                      <span className="text-primary">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={createProduct.isPending || updateProduct.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Product" : "Save Product"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
