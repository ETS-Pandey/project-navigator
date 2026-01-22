import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Book, Search, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useChartOfAccounts, useAccountLedger } from "@/hooks/useAccounting";
import { formatCurrency } from "@/lib/formatters";

export default function Ledgers() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: accounts = [], isLoading: loadingAccounts } = useChartOfAccounts();
  const { data: ledgerEntries = [], isLoading: loadingLedger } = useAccountLedger(
    selectedAccountId,
    dateFrom || undefined,
    dateTo || undefined
  );

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  // Calculate running balance
  const entriesWithBalance = useMemo(() => {
    let runningBalance = selectedAccount?.opening_balance || 0;
    return ledgerEntries.map((entry) => {
      const debit = Number(entry.debit_amount) || 0;
      const credit = Number(entry.credit_amount) || 0;
      
      // For asset/expense accounts: debit increases, credit decreases
      // For liability/equity/income accounts: credit increases, debit decreases
      const isDebitNature = ["asset", "expense"].includes(selectedAccount?.account_type || "");
      if (isDebitNature) {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }
      
      return { ...entry, runningBalance };
    });
  }, [ledgerEntries, selectedAccount]);

  const totalDebit = ledgerEntries.reduce((sum, e) => sum + (Number(e.debit_amount) || 0), 0);
  const totalCredit = ledgerEntries.reduce((sum, e) => sum + (Number(e.credit_amount) || 0), 0);
  const closingBalance = entriesWithBalance.length > 0 
    ? entriesWithBalance[entriesWithBalance.length - 1].runningBalance 
    : (selectedAccount?.opening_balance || 0);

  const accountTypeColors: Record<string, string> = {
    asset: "bg-blue-100 text-blue-800",
    liability: "bg-purple-100 text-purple-800",
    equity: "bg-green-100 text-green-800",
    income: "bg-emerald-100 text-emerald-800",
    expense: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Book className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledgers</h1>
          <p className="text-muted-foreground">View account-wise transaction details</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label>Select Account</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_code} - {account.account_name}
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

      {selectedAccount && (
        <>
          {/* Account Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedAccount.account_code} - {selectedAccount.account_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAccount.description || "No description"}
                  </p>
                </div>
                <Badge className={accountTypeColors[selectedAccount.account_type]}>
                  {selectedAccount.account_type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Opening Balance</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedAccount.opening_balance)}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Debit</p>
                  <p className="text-lg font-semibold text-green-700">
                    {formatCurrency(totalDebit)}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Credit</p>
                  <p className="text-lg font-semibold text-red-700">
                    {formatCurrency(totalCredit)}
                  </p>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Closing Balance</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(closingBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Entry No.</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={3} className="font-medium">
                      Opening Balance
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(selectedAccount.opening_balance)}
                    </TableCell>
                  </TableRow>
                  
                  {loadingLedger ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : entriesWithBalance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    entriesWithBalance.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {entry.journal_entry?.entry_date 
                            ? format(new Date(entry.journal_entry.entry_date), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entry.journal_entry?.entry_number}
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
                        <TableCell className="text-right font-medium">
                          {formatCurrency(entry.runningBalance)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  
                  {/* Closing Balance Row */}
                  {entriesWithBalance.length > 0 && (
                    <TableRow className="bg-muted/30 font-semibold">
                      <TableCell colSpan={3}>Closing Balance</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(totalDebit)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(totalCredit)}
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
        </>
      )}

      {!selectedAccountId && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Select an Account</h3>
            <p className="text-muted-foreground">
              Choose an account from the dropdown above to view its ledger
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
