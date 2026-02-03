import { useState } from "react";
import { usePettyCashFunds, usePettyCashTransactions, useCreatePettyCashFund, useCreatePettyCashTransaction, useReplenishPettyCash } from "@/hooks/usePettyCash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const fundFormSchema = z.object({
  fund_name: z.string().min(1, "Fund name is required"),
  opening_balance: z.coerce.number().min(0, "Opening balance must be positive"),
  max_single_expense: z.coerce.number().optional(),
});

type FundFormData = z.infer<typeof fundFormSchema>;

const transactionFormSchema = z.object({
  fund_id: z.string().min(1, "Select a fund"),
  transaction_type: z.enum(["receipt", "payment", "replenishment"]),
  amount: z.coerce.number().min(0.01, "Amount is required"),
  description: z.string().optional(),
  reference_number: z.string().optional(),
  transaction_date: z.string().min(1, "Date is required"),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

export default function PettyCash() {
  const [selectedFund, setSelectedFund] = useState<string>("all");
  const [isNewFundDialogOpen, setIsNewFundDialogOpen] = useState(false);
  const [isNewTransactionDialogOpen, setIsNewTransactionDialogOpen] = useState(false);
  const [isReplenishDialogOpen, setIsReplenishDialogOpen] = useState(false);
  const [replenishFundId, setReplenishFundId] = useState<string>("");
  const [replenishAmount, setReplenishAmount] = useState<string>("");
  
  const { data: funds = [], isLoading: fundsLoading } = usePettyCashFunds();
  const { data: transactions = [], isLoading: transactionsLoading } = usePettyCashTransactions(
    selectedFund !== "all" ? selectedFund : undefined
  );
  
  const createFund = useCreatePettyCashFund();
  const createTransaction = useCreatePettyCashTransaction();
  const replenish = useReplenishPettyCash();
  
  const fundForm = useForm<FundFormData>({
    resolver: zodResolver(fundFormSchema),
    defaultValues: {
      fund_name: "Main Petty Cash",
      opening_balance: 10000,
      max_single_expense: undefined,
    },
  });
  
  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      fund_id: "",
      transaction_type: "payment",
      amount: 0,
      description: "",
      reference_number: "",
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });
  
  const onSubmitFund = async (data: FundFormData) => {
    await createFund.mutateAsync({
      fund_name: data.fund_name,
      opening_balance: data.opening_balance,
      max_single_expense: data.max_single_expense,
    });
    setIsNewFundDialogOpen(false);
    fundForm.reset();
  };
  
  const onSubmitTransaction = async (data: TransactionFormData) => {
    await createTransaction.mutateAsync({
      fund_id: data.fund_id,
      transaction_type: data.transaction_type,
      amount: data.amount,
      description: data.description,
      reference_number: data.reference_number,
      transaction_date: data.transaction_date,
    });
    setIsNewTransactionDialogOpen(false);
    transactionForm.reset();
  };
  
  const handleReplenish = async () => {
    if (!replenishFundId || !replenishAmount) return;
    await replenish.mutateAsync({
      fundId: replenishFundId,
      amount: parseFloat(replenishAmount),
    });
    setIsReplenishDialogOpen(false);
    setReplenishFundId("");
    setReplenishAmount("");
  };
  
  const totalBalance = funds.reduce((sum, f) => sum + Number(f.current_balance), 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Petty Cash</h1>
          <p className="text-muted-foreground">Manage petty cash funds and transactions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewFundDialogOpen} onOpenChange={setIsNewFundDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                New Fund
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Petty Cash Fund</DialogTitle>
              </DialogHeader>
              <Form {...fundForm}>
                <form onSubmit={fundForm.handleSubmit(onSubmitFund)} className="space-y-4">
                  <FormField
                    control={fundForm.control}
                    name="fund_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fund Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={fundForm.control}
                    name="opening_balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Balance (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={fundForm.control}
                    name="max_single_expense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Single Expense (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional limit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsNewFundDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createFund.isPending}>
                      Create Fund
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isNewTransactionDialogOpen} onOpenChange={setIsNewTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Petty Cash Transaction</DialogTitle>
              </DialogHeader>
              <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(onSubmitTransaction)} className="space-y-4">
                  <FormField
                    control={transactionForm.control}
                    name="fund_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fund</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fund" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {funds.map((fund) => (
                              <SelectItem key={fund.id} value={fund.id}>
                                {fund.fund_name} ({formatCurrency(fund.current_balance)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={transactionForm.control}
                      name="transaction_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="payment">Payment</SelectItem>
                              <SelectItem value="receipt">Receipt</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transactionForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={transactionForm.control}
                    name="transaction_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="reference_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Bill/voucher number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsNewTransactionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTransaction.isPending}>
                      Record
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Fund Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">{funds.length} active fund(s)</p>
          </CardContent>
        </Card>
        
        {funds.slice(0, 3).map((fund) => (
          <Card key={fund.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">{fund.fund_name}</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setReplenishFundId(fund.id);
                  setIsReplenishDialogOpen(true);
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(fund.current_balance)}</div>
              <p className="text-xs text-muted-foreground">
                Opened: {formatCurrency(fund.opening_balance)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Replenish Dialog */}
      <Dialog open={isReplenishDialogOpen} onOpenChange={setIsReplenishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replenish Petty Cash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                value={replenishAmount}
                onChange={(e) => setReplenishAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReplenishDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReplenish} disabled={replenish.isPending}>
                Replenish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <Select value={selectedFund} onValueChange={setSelectedFund}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by fund" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Funds</SelectItem>
              {funds.map((fund) => (
                <SelectItem key={fund.id} value={fund.id}>
                  {fund.fund_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{format(new Date(txn.transaction_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={txn.transaction_type === "payment" ? "destructive" : "default"}
                        className="capitalize"
                      >
                        {txn.transaction_type === "payment" && <ArrowDownCircle className="mr-1 h-3 w-3" />}
                        {txn.transaction_type === "receipt" && <ArrowUpCircle className="mr-1 h-3 w-3" />}
                        {txn.transaction_type === "replenishment" && <RefreshCw className="mr-1 h-3 w-3" />}
                        {txn.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{txn.description || "-"}</TableCell>
                    <TableCell>{txn.reference_number || "-"}</TableCell>
                    <TableCell className={`text-right font-medium ${txn.transaction_type === "payment" ? "text-red-600" : "text-green-600"}`}>
                      {txn.transaction_type === "payment" ? "-" : "+"}{formatCurrency(txn.amount)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(txn.balance_after)}</TableCell>
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
