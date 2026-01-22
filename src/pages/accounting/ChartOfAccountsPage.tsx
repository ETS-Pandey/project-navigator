import { useState } from "react";
import { useChartOfAccounts, useCreateAccount } from "@/hooks/useAccounting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Landmark, ArrowUpRight, ArrowDownRight, Scale, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AccountType } from "@/types/accounting";

const accountFormSchema = z.object({
  account_code: z.string().min(1, "Account code is required"),
  account_name: z.string().min(1, "Account name is required"),
  account_type: z.enum(["asset", "liability", "equity", "income", "expense"]),
  description: z.string().optional(),
  opening_balance: z.coerce.number().optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

const accountTypeConfig: Record<AccountType, { label: string; color: string; icon: React.ReactNode }> = {
  asset: { label: "Assets", color: "bg-blue-100 text-blue-800", icon: <ArrowUpRight className="h-4 w-4" /> },
  liability: { label: "Liabilities", color: "bg-red-100 text-red-800", icon: <ArrowDownRight className="h-4 w-4" /> },
  equity: { label: "Equity", color: "bg-purple-100 text-purple-800", icon: <Scale className="h-4 w-4" /> },
  income: { label: "Income", color: "bg-green-100 text-green-800", icon: <ArrowUpRight className="h-4 w-4" /> },
  expense: { label: "Expenses", color: "bg-orange-100 text-orange-800", icon: <Wallet className="h-4 w-4" /> },
};

export default function ChartOfAccountsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<AccountType | "all">("all");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  
  const { data: accounts = [], isLoading } = useChartOfAccounts(
    activeTab !== "all" ? activeTab : undefined
  );
  const createAccount = useCreateAccount();
  
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      account_code: "",
      account_name: "",
      account_type: "asset",
      opening_balance: 0,
    },
  });
  
  const filteredAccounts = accounts.filter((account) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      account.account_code.toLowerCase().includes(searchLower) ||
      account.account_name.toLowerCase().includes(searchLower)
    );
  });
  
  const onSubmit = async (data: AccountFormData) => {
    await createAccount.mutateAsync(data as { account_code: string; account_name: string; account_type: AccountType; description?: string; opening_balance?: number });
    setIsNewDialogOpen(false);
    form.reset();
  };
  
  // Group accounts by type for stats
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.account_type;
    if (!acc[type]) acc[type] = { count: 0, balance: 0 };
    acc[type].count += 1;
    acc[type].balance += Number(account.current_balance);
    return acc;
  }, {} as Record<string, { count: number; balance: number }>);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your accounting ledgers</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="account_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="asset">Asset</SelectItem>
                          <SelectItem value="liability">Liability</SelectItem>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="account_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="opening_balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Balance</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="account_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Petty Cash" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAccount.isPending}>
                    {createAccount.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {(Object.keys(accountTypeConfig) as AccountType[]).map((type) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{accountTypeConfig[type].label}</CardTitle>
              {accountTypeConfig[type].icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accountsByType[type]?.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(accountsByType[type]?.balance || 0)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Accounts Table with Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AccountType | "all")}>
          <CardHeader>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="asset">Assets</TabsTrigger>
              <TabsTrigger value="liability">Liabilities</TabsTrigger>
              <TabsTrigger value="equity">Equity</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Opening Balance</TableHead>
                  <TableHead className="text-right">Current Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono font-medium">{account.account_code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {account.account_name}
                          {account.is_system_account && (
                            <Badge variant="secondary" className="text-xs">System</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={accountTypeConfig[account.account_type].color}>
                          {accountTypeConfig[account.account_type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-muted-foreground">
                          {account.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(account.opening_balance)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.current_balance)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
