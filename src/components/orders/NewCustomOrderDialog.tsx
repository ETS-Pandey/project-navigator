import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCustomOrder } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { KarigarSelect } from "@/components/karigar/KarigarSelect";
import { AITextAssist } from "@/components/ai/AITextAssist";

const formSchema = z.object({
  customer_id: z.string().optional(),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_phone: z.string().optional(),
  design_description: z.string().min(1, "Design description is required"),
  design_reference_url: z.string().optional(),
  metal_type: z.string().optional(),
  purity: z.string().optional(),
  estimated_weight: z.coerce.number().optional(),
  estimated_cost: z.coerce.number().optional(),
  advance_paid: z.coerce.number().optional(),
  expected_date: z.string().optional(),
  assigned_karigar: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  onClose: () => void;
}

export default function NewCustomOrderDialog({ onClose }: Props) {
  const { data: customers = [] } = useCustomers();
  const createOrder = useCreateCustomOrder();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "",
      design_description: "",
    },
  });
  
  const onSubmit = async (data: FormData) => {
    await createOrder.mutateAsync(data as unknown as import("@/types/orders").CustomOrderFormData);
    onClose();
  };
  
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      form.setValue("customer_id", customerId);
      form.setValue("customer_name", customer.name);
      form.setValue("customer_phone", customer.phone || "");
    }
  };
  
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>New Custom Order</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Customer Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormItem>
              <FormLabel>Select Customer</FormLabel>
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select existing customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            
            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="customer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter customer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Design Details */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Design Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="design_description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Design Description *</FormLabel>
                      <AITextAssist
                        fieldName="order_notes"
                        context="custom jewelry design description"
                        onSuggestion={(text) => field.onChange(text)}
                      />
                    </div>
                    <FormControl>
                      <Textarea placeholder="Describe the custom design (e.g., Engagement ring with solitaire)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="design_reference_url"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Design Reference URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/design-image" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="metal_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metal Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metal" />
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
                    <FormLabel>Purity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="24K">24K</SelectItem>
                        <SelectItem value="22K">22K</SelectItem>
                        <SelectItem value="18K">18K</SelectItem>
                        <SelectItem value="14K">14K</SelectItem>
                        <SelectItem value="925">925 Silver</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimated_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Weight (grams)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" placeholder="0.000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assigned_karigar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Karigar</FormLabel>
                    <FormControl>
                      <KarigarSelect
                        value={field.value}
                        onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                        placeholder="Select Karigar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Pricing & Schedule */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Pricing & Schedule</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="estimated_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="advance_paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance Paid (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expected_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Completion</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Notes</FormLabel>
                  <AITextAssist
                    fieldName="order_notes"
                    context="custom order notes"
                    onSuggestion={(text) => field.onChange(text)}
                  />
                </div>
                <FormControl>
                  <Textarea placeholder="Any additional notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
