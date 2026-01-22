import { useState } from "react";
import { useJournalEntries, useDayBookStats, useChartOfAccounts, useCreateJournalEntry } from "@/hooks/useAccounting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, BookOpen, TrendingUp, TrendingDown, ArrowRightLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const journalFormSchema = z.object({
  entry_date: z.string().min(1, "Date is required"),
  narration: z.string().optional(),
  lines: z.array(z.object({
    account_id: z.string().min(1, "Account is required"),
    debit_amount: z.coerce.number().optional(),
    credit_amount: z.coerce.number().optional(),
    narration: z.string().optional(),
  })).min(2, "At least 2 lines required"),
});

type JournalFormData = z.infer<typeof journalFormSchema>;

export default function DayBook() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  
  const { data: entries = [], isLoading } = useJournalEntries({ dateFrom: dateFilter, dateTo: dateFilter });
  const { data: stats } = useDayBookStats(dateFilter);
  const { data: accounts = [] } = useChartOfAccounts();
  const createEntry = useCreateJournalEntry();
  
  const form = useForm<JournalFormData>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      entry_date: new Date().toISOString().split("T")[0],
      narration: "",
      lines: [
        { account_id: "", debit_amount: 0, credit_amount: 0 },
        { account_id: "", debit_amount: 0, credit_amount: 0 },
      ],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });
  
  const filteredEntries = entries.filter((entry) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      entry.entry_number.toLowerCase().includes(searchLower) ||
      entry.narration?.toLowerCase().includes(searchLower)
    );
  });
  
  const onSubmit = async (data: JournalFormData) => {
    try {
      await createEntry.mutateAsync(data as import("@/types/accounting").JournalEntryFormData);
      setIsNewDialogOpen(false);
      form.reset();
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const watchedLines = form.watch("lines");
  const totalDebit = watchedLines.reduce((sum, line) => sum + (Number(line.debit_amount) || 0), 0);
  const totalCredit = watchedLines.reduce((sum, line) => sum + (Number(line.credit_amount) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Day Book</h1>
          <p className="text-muted-foreground">Daily journal entries and transactions</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Journal Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="entry_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="narration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Narration</FormLabel>
                        <FormControl>
                          <Input placeholder="Description of the entry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Entry Lines</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ account_id: "", debit_amount: 0, credit_amount: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Line
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid gap-2 md:grid-cols-4 items-end">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.account_id`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className={index === 0 ? "" : "sr-only"}>Account</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                      {acc.account_code} - {acc.account_name}
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
                          name={`lines.${index}.debit_amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={index === 0 ? "" : "sr-only"}>Debit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (Number(e.target.value) > 0) {
                                      form.setValue(`lines.${index}.credit_amount`, 0);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`lines.${index}.credit_amount`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className={index === 0 ? "" : "sr-only"}>Credit</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      if (Number(e.target.value) > 0) {
                                        form.setValue(`lines.${index}.debit_amount`, 0);
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {fields.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mt-auto"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-8 pt-4 border-t">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Debit</div>
                      <div className="text-lg font-bold">{formatCurrency(totalDebit)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Credit</div>
                      <div className="text-lg font-bold">{formatCurrency(totalCredit)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Difference</div>
                      <div className={`text-lg font-bold ${isBalanced ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEntry.isPending || !isBalanced}>
                    {createEntry.isPending ? "Creating..." : "Create Entry"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.entryCount || 0}</div>
            <p className="text-xs text-muted-foreground">for {format(new Date(dateFilter), "dd MMM yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalDebit || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalCredit || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (stats?.totalDebit || 0) === (stats?.totalCredit || 0) ? "text-green-600" : "text-red-600"
            }`}>
              {(stats?.totalDebit || 0) === (stats?.totalCredit || 0) ? "Balanced" : "Unbalanced"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-[180px]"
        />
      </div>
      
      {/* Entries Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Narration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No entries found for this date
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.entry_number}</TableCell>
                    <TableCell>{format(new Date(entry.entry_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">{entry.narration || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-muted-foreground">{entry.reference_type || "manual"}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(entry.total_debit)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(entry.total_credit)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
