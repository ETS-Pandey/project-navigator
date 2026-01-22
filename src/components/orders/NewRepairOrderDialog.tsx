import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateRepairOrder } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";

const formSchema = z.object({
  customer_id: z.string().optional(),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_phone: z.string().optional(),
  item_description: z.string().min(1, "Item description is required"),
  item_type: z.string().optional(),
  metal_type: z.string().optional(),
  purity: z.string().optional(),
  weight_received: z.coerce.number().optional(),
  issue_description: z.string().optional(),
  estimated_cost: z.coerce.number().optional(),
  advance_paid: z.coerce.number().optional(),
  expected_date: z.string().optional(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  onClose: () => void;
}

export default function NewRepairOrderDialog({ onClose }: Props) {
  const { data: customers = [] } = useCustomers();
  const createOrder = useCreateRepairOrder();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "",
      item_description: "",
    },
  });
  
  const onSubmit = async (data: FormData) => {
    await createOrder.mutateAsync(data as unknown as import("@/types/orders").RepairOrderFormData);
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
        <DialogTitle>New Repair Order</DialogTitle>
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
          
          {/* Item Details */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Item Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="item_description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Item Description *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the item (e.g., Gold chain, Ring)" {...field} />
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
                name="weight_received"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Received (grams)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" placeholder="0.000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="issue_description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Issue / Work Required</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the repair work needed" {...field} />
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
                <FormLabel>Notes</FormLabel>
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
