import { useState } from "react";
import { useBudgets, useActiveBudgets, useCreateBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { useExpenseCategories } from "@/hooks/useExpenses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, AlertTriangle, TrendingUp, Trash2 } from "lucide-react";
import { format, addMonths, addQuarters, addYears, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const budgetFormSchema = z.object({
  budget_name: z.string().min(1, "Budget name is required"),
  category_id: z.string().optional(),
  period_type: z.enum(["monthly", "quarterly", "yearly"]),
  period_start: z.string().min(1, "Start date is required"),
  period_end: z.string().min(1, "End date is required"),
  budgeted_amount: z.coerce.number().min(1, "Budget amount is required"),
  alert_threshold_percent: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

export default function Budgets() {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [periodTypeFilter, setPeriodTypeFilter] = useState<string>("all");
  
  const { data: budgets = [], isLoading } = useBudgets(
    periodTypeFilter !== "all" ? periodTypeFilter : undefined
  );
  const { data: activeBudgets = [] } = useActiveBudgets();
  const { data: categories = [] } = useExpenseCategories();
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();
  
  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      budget_name: "",
      category_id: "",
      period_type: "monthly",
      period_start: "",
      period_end: "",
      budgeted_amount: 0,
      alert_threshold_percent: 80,
      notes: "",
    },
  });
  
  const watchPeriodType = form.watch("period_type");
  
  // Auto-calculate period dates based on type
  const handlePeriodTypeChange = (type: "monthly" | "quarterly" | "yearly") => {
    form.setValue("period_type", type);
    const today = new Date();
    
    let start: Date, end: Date;
    switch (type) {
      case "monthly":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "quarterly":
        start = startOfQuarter(today);
        end = endOfQuarter(today);
        break;
      case "yearly":
        // Financial year in India: April to March
        const currentYear = today.getFullYear();
        const month = today.getMonth();
        if (month >= 3) { // April onwards
          start = new Date(currentYear, 3, 1);
          end = new Date(currentYear + 1, 2, 31);
        } else {
          start = new Date(currentYear - 1, 3, 1);
          end = new Date(currentYear, 2, 31);
        }
        break;
    }
    
    form.setValue("period_start", format(start, "yyyy-MM-dd"));
    form.setValue("period_end", format(end, "yyyy-MM-dd"));
  };
  
  const onSubmit = async (data: BudgetFormData) => {
    await createBudget.mutateAsync({
      budget_name: data.budget_name,
      category_id: data.category_id,
      period_type: data.period_type,
      period_start: data.period_start,
      period_end: data.period_end,
      budgeted_amount: data.budgeted_amount,
      alert_threshold_percent: data.alert_threshold_percent,
      notes: data.notes,
    });
    setIsNewDialogOpen(false);
    form.reset();
  };
  
  const getUtilizationColor = (percent: number, threshold: number) => {
    if (percent >= 100) return "text-red-600";
    if (percent >= threshold) return "text-amber-600";
    return "text-green-600";
  };
  
  const getProgressColor = (percent: number, threshold: number) => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= threshold) return "bg-amber-500";
    return "bg-green-500";
  };
  
  const alertBudgets = activeBudgets.filter(
    (b) => b.utilization_percent >= (b.alert_threshold_percent || 80)
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Track and manage expense budgets</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="budget_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Office Supplies Q1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All categories (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
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
                  name="period_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Type *</FormLabel>
                      <Select onValueChange={handlePeriodTypeChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="period_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="period_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="budgeted_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Amount (₹) *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alert_threshold_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
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
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBudget.isPending}>
                    Create Budget
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Alerts */}
      {alertBudgets.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertBudgets.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{budget.budget_name}</span>
                  <span className={getUtilizationColor(budget.utilization_percent, budget.alert_threshold_percent || 80)}>
                    {budget.utilization_percent.toFixed(1)}% utilized
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Filter */}
      <div className="flex gap-4">
        <Select value={periodTypeFilter} onValueChange={setPeriodTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Budget Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">Loading...</CardContent>
          </Card>
        ) : budgets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No budgets found. Create your first budget to start tracking expenses.
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{budget.budget_name}</CardTitle>
                    <CardDescription>
                      {budget.category?.name || "All Categories"} • 
                      <Badge variant="outline" className="ml-1 capitalize">{budget.period_type}</Badge>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBudget.mutate(budget.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {format(new Date(budget.period_start), "dd MMM")} - {format(new Date(budget.period_end), "dd MMM yyyy")}
                  </span>
                  <span className={`font-bold ${getUtilizationColor(budget.utilization_percent, budget.alert_threshold_percent || 80)}`}>
                    {budget.utilization_percent.toFixed(1)}%
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(budget.utilization_percent, 100)} 
                  className={`h-2 ${getProgressColor(budget.utilization_percent, budget.alert_threshold_percent || 80)}`}
                />
                
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="text-muted-foreground">Budget</div>
                    <div className="font-semibold">{formatCurrency(budget.budgeted_amount)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Spent</div>
                    <div className="font-semibold text-red-600">{formatCurrency(budget.spent_amount || 0)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Remaining</div>
                    <div className={`font-semibold ${budget.remaining_amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(budget.remaining_amount)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
