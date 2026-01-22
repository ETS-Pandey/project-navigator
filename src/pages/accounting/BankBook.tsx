import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Building2, Plus, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChartOfAccounts, useAccountLedger } from "@/hooks/useAccounting";
import { formatCurrency } from "@/lib/formatters";

export default function BankBook() {
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: allAccounts = [], isLoading: loadingAccounts } = useChartOfAccounts();
  
  // Filter only bank/cash accounts (asset type accounts with bank/cash in name)
  const bankAccounts = useMemo(() => 
    allAccounts.filter(a => 
      a.account_type === "asset" && 
      (a.account_name.toLowerCase().includes("bank") || 
       a.account_name.toLowerCase().includes("cash") ||
       a.account_code.startsWith("1001") || // Assuming bank accounts start with 1001
       a.account_code.startsWith("1002"))   // Cash accounts
    ),
    [allAccounts]
  );

  const { data: ledgerEntries = [], isLoading: loadingLedger } = useAccountLedger(
    selectedBankId,
    dateFrom || undefined,
    dateTo || undefined
  );

  const selectedBank = useMemo(
    () => bankAccounts.find((a) => a.id === selectedBankId),
    [bankAccounts, selectedBankId]
  );

  // Calculate running balance and categorize transactions
  const processedEntries = useMemo(() => {
    let runningBalance = selectedBank?.opening_balance || 0;
    return ledgerEntries.map((entry) => {
      const debit = Number(entry.debit_amount) || 0;
      const credit = Number(entry.credit_amount) || 0;
      runningBalance += debit - credit; // Assets: debit increases, credit decreases
      
      const transactionType = debit > 0 ? "receipt" : "payment";
      
      return { 
        ...entry, 
        runningBalance,
        transactionType,
        amount: debit || credit
      };
    });
  }, [ledgerEntries, selectedBank]);

  const receipts = processedEntries.filter(e => e.transactionType === "receipt");
  const payments = processedEntries.filter(e => e.transactionType === "payment");

  const totalReceipts = receipts.reduce((sum, e) => sum + e.amount, 0);
  const totalPayments = payments.reduce((sum, e) => sum + e.amount, 0);
  const closingBalance = processedEntries.length > 0 
    ? processedEntries[processedEntries.length - 1].runningBalance 
    : (selectedBank?.opening_balance || 0);

  // Summary of all bank accounts
  const bankSummary = useMemo(() => 
    bankAccounts.map(bank => ({
      ...bank,
      balance: bank.current_balance
    })),
    [bankAccounts]
  );

  const totalBankBalance = bankSummary.reduce((sum, b) => sum + (b.balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bank Book</h1>
            <p className="text-muted-foreground">Track bank and cash transactions</p>
          </div>
        </div>
      </div>

      {/* Bank Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {bankSummary.slice(0, 3).map((bank) => (
          <Card 
            key={bank.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedBankId === bank.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedBankId(bank.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {bank.account_name.toLowerCase().includes("cash") ? (
                    <Wallet className="h-5 w-5 text-primary" />
                  ) : (
                    <Building2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{bank.account_name}</p>
                  <p className="text-xs text-muted-foreground">{bank.account_code}</p>
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">
                {formatCurrency(bank.balance || 0)}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Total Balance</p>
            </div>
            <p className="text-2xl font-bold mt-3 text-primary">
              {formatCurrency(totalBankBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label>Select Bank/Cash Account</Label>
              <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bank account..." />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.account_code} - {bank.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBank && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Opening Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(selectedBank.opening_balance)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <p className="text-sm text-green-700">Total Receipts</p>
                <p className="text-2xl font-bold text-green-700">
                  + {formatCurrency(totalReceipts)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm text-red-700">Total Payments</p>
                <p className="text-2xl font-bold text-red-700">
                  - {formatCurrency(totalPayments)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-primary">Closing Balance</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(closingBalance)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="receipts">
                Receipts ({receipts.length})
              </TabsTrigger>
              <TabsTrigger value="payments">
                Payments ({payments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TransactionTable 
                entries={processedEntries} 
                loading={loadingLedger}
                openingBalance={selectedBank.opening_balance}
                closingBalance={closingBalance}
              />
            </TabsContent>

            <TabsContent value="receipts">
              <TransactionTable 
                entries={receipts} 
                loading={loadingLedger}
                showBalance={false}
              />
            </TabsContent>

            <TabsContent value="payments">
              <TransactionTable 
                entries={payments} 
                loading={loadingLedger}
                showBalance={false}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {!selectedBankId && bankAccounts.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Select a Bank Account</h3>
            <p className="text-muted-foreground">
              Click on a bank card above or use the dropdown to view transactions
            </p>
          </CardContent>
        </Card>
      )}

      {bankAccounts.length === 0 && !loadingAccounts && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Bank Accounts Found</h3>
            <p className="text-muted-foreground mb-4">
              Create bank and cash accounts in Chart of Accounts first
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TransactionTableProps {
  entries: Array<{
    id: string;
    journal_entry?: {
      entry_date: string;
      entry_number: string;
      narration?: string | null;
      reference_type?: string | null;
    };
    narration?: string | null;
    debit_amount: number;
    credit_amount: number;
    transactionType: string;
    amount: number;
    runningBalance: number;
  }>;
  loading: boolean;
  openingBalance?: number;
  closingBalance?: number;
  showBalance?: boolean;
}

function TransactionTable({ 
  entries, 
  loading, 
  openingBalance,
  closingBalance,
  showBalance = true 
}: TransactionTableProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entry No.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Particulars</TableHead>
              <TableHead className="text-right">Receipt</TableHead>
              <TableHead className="text-right">Payment</TableHead>
              {showBalance && <TableHead className="text-right">Balance</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {showBalance && openingBalance !== undefined && (
              <TableRow className="bg-muted/30">
                <TableCell colSpan={4} className="font-medium">
                  Opening Balance
                </TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(openingBalance)}
                </TableCell>
              </TableRow>
            )}
            
            {loading ? (
              <TableRow>
                <TableCell colSpan={showBalance ? 7 : 6} className="text-center py-8">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showBalance ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.journal_entry?.entry_date 
                      ? format(new Date(entry.journal_entry.entry_date), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {entry.journal_entry?.entry_number}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.transactionType === "receipt" ? "default" : "secondary"}>
                      {entry.transactionType === "receipt" ? "Receipt" : "Payment"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {entry.narration || entry.journal_entry?.narration || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(entry.debit_amount) > 0 && (
                      <span className="flex items-center justify-end gap-1 text-green-600">
                        <ArrowUpRight className="h-3 w-3" />
                        {formatCurrency(entry.debit_amount)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(entry.credit_amount) > 0 && (
                      <span className="flex items-center justify-end gap-1 text-red-600">
                        <ArrowDownLeft className="h-3 w-3" />
                        {formatCurrency(entry.credit_amount)}
                      </span>
                    )}
                  </TableCell>
                  {showBalance && (
                    <TableCell className="text-right font-medium">
                      {formatCurrency(entry.runningBalance)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            
            {showBalance && closingBalance !== undefined && entries.length > 0 && (
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={4}>Closing Balance</TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(entries.reduce((s, e) => s + Number(e.debit_amount || 0), 0))}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(entries.reduce((s, e) => s + Number(e.credit_amount || 0), 0))}
                </TableCell>
                <TableCell className="text-right text-primary">
                  {formatCurrency(closingBalance)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
