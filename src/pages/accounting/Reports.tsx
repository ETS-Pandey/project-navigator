import { useState, useMemo } from "react";
import { format } from "date-fns";
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useChartOfAccounts } from "@/hooks/useAccounting";
import { formatCurrency } from "@/lib/formatters";
import type { ChartOfAccount, AccountType } from "@/types/accounting";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0] // Start of year
  );
  const [dateTo, setDateTo] = useState<string>(
    new Date().toISOString().split("T")[0] // Today
  );

  const { data: accounts = [], isLoading } = useChartOfAccounts();

  // Group accounts by type
  const accountsByType = useMemo(() => {
    const grouped: Record<AccountType, ChartOfAccount[]> = {
      asset: [],
      liability: [],
      equity: [],
      income: [],
      expense: [],
    };
    
    accounts.forEach((account) => {
      if (grouped[account.account_type]) {
        grouped[account.account_type].push(account);
      }
    });
    
    return grouped;
  }, [accounts]);

  // Calculate totals for each type
  const totals = useMemo(() => {
    const calc = (type: AccountType) => 
      accountsByType[type].reduce((sum, a) => sum + (a.current_balance || 0), 0);
    
    return {
      assets: calc("asset"),
      liabilities: calc("liability"),
      equity: calc("equity"),
      income: calc("income"),
      expense: calc("expense"),
    };
  }, [accountsByType]);

  // Derived financial metrics
  const netProfit = totals.income - totals.expense;
  const netWorth = totals.assets - totals.liabilities;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">View financial statements and reports</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
            </Button>
            <Button variant="outline">
              This Quarter
            </Button>
            <Button variant="outline">
              This Year
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Total Income</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.income)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">Total Expenses</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.expense)}
            </p>
          </CardContent>
        </Card>
        <Card className={netProfit >= 0 ? "bg-green-50" : "bg-red-50"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Scale className="h-4 w-4" />
              <span className="text-sm">Net Profit/Loss</span>
            </div>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
              {netProfit >= 0 ? "" : "-"}{formatCurrency(Math.abs(netProfit))}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Scale className="h-4 w-4" />
              <span className="text-sm">Net Worth</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(netWorth)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="trial-balance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        </TabsList>

        {/* Trial Balance */}
        <TabsContent value="trial-balance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trial Balance</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account) => {
                      const balance = account.current_balance || 0;
                      const isDebitNature = ["asset", "expense"].includes(account.account_type);
                      const debit = isDebitNature && balance > 0 ? balance : (!isDebitNature && balance < 0 ? Math.abs(balance) : 0);
                      const credit = !isDebitNature && balance > 0 ? balance : (isDebitNature && balance < 0 ? Math.abs(balance) : 0);
                      
                      if (balance === 0) return null;
                      
                      return (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono">{account.account_code}</TableCell>
                          <TableCell>{account.account_name}</TableCell>
                          <TableCell className="capitalize">{account.account_type}</TableCell>
                          <TableCell className="text-right">
                            {debit > 0 ? formatCurrency(debit) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {credit > 0 ? formatCurrency(credit) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        accounts.reduce((sum, a) => {
                          const bal = a.current_balance || 0;
                          const isDebit = ["asset", "expense"].includes(a.account_type);
                          return sum + (isDebit && bal > 0 ? bal : (!isDebit && bal < 0 ? Math.abs(bal) : 0));
                        }, 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        accounts.reduce((sum, a) => {
                          const bal = a.current_balance || 0;
                          const isDebit = ["asset", "expense"].includes(a.account_type);
                          return sum + (!isDebit && bal > 0 ? bal : (isDebit && bal < 0 ? Math.abs(bal) : 0));
                        }, 0)
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="profit-loss">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profit & Loss Statement</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Income Section */}
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Income
                </h3>
                <Table>
                  <TableBody>
                    {accountsByType.income.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono text-sm">{account.account_code}</TableCell>
                        <TableCell>{account.account_name}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(account.current_balance || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {accountsByType.income.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No income accounts
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-green-50 font-semibold">
                      <TableCell colSpan={2}>Total Income</TableCell>
                      <TableCell className="text-right text-green-700">
                        {formatCurrency(totals.income)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Expense Section */}
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Expenses
                </h3>
                <Table>
                  <TableBody>
                    {accountsByType.expense.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono text-sm">{account.account_code}</TableCell>
                        <TableCell>{account.account_name}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(account.current_balance || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {accountsByType.expense.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No expense accounts
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-red-50 font-semibold">
                      <TableCell colSpan={2}>Total Expenses</TableCell>
                      <TableCell className="text-right text-red-700">
                        {formatCurrency(totals.expense)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Net Profit/Loss */}
              <div className={`p-4 rounded-lg ${netProfit >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">
                    Net {netProfit >= 0 ? "Profit" : "Loss"}
                  </span>
                  <span className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {formatCurrency(Math.abs(netProfit))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Balance Sheet</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Assets */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">Assets</h3>
                  <Table>
                    <TableBody>
                      {accountsByType.asset.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono text-sm">{account.account_code}</TableCell>
                          <TableCell>{account.account_name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(account.current_balance || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {accountsByType.asset.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No asset accounts
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="bg-blue-50 font-semibold">
                        <TableCell colSpan={2}>Total Assets</TableCell>
                        <TableCell className="text-right text-blue-700">
                          {formatCurrency(totals.assets)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Liabilities & Equity */}
                <div className="space-y-6">
                  {/* Liabilities */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-700 mb-3">Liabilities</h3>
                    <Table>
                      <TableBody>
                        {accountsByType.liability.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-mono text-sm">{account.account_code}</TableCell>
                            <TableCell>{account.account_name}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(account.current_balance || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {accountsByType.liability.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No liability accounts
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className="bg-purple-50 font-semibold">
                          <TableCell colSpan={2}>Total Liabilities</TableCell>
                          <TableCell className="text-right text-purple-700">
                            {formatCurrency(totals.liabilities)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Equity */}
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-700 mb-3">Equity</h3>
                    <Table>
                      <TableBody>
                        {accountsByType.equity.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-mono text-sm">{account.account_code}</TableCell>
                            <TableCell>{account.account_name}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(account.current_balance || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell className="italic">Retained Earnings (P&L)</TableCell>
                          <TableCell className={`text-right ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(netProfit)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-emerald-50 font-semibold">
                          <TableCell colSpan={2}>Total Equity</TableCell>
                          <TableCell className="text-right text-emerald-700">
                            {formatCurrency(totals.equity + netProfit)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Total Liabilities + Equity */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Liabilities + Equity</span>
                      <span>{formatCurrency(totals.liabilities + totals.equity + netProfit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              <div className={`mt-6 p-4 rounded-lg ${
                Math.abs(totals.assets - (totals.liabilities + totals.equity + netProfit)) < 0.01
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <Scale className="h-5 w-5" />
                  <span className="font-medium">
                    {Math.abs(totals.assets - (totals.liabilities + totals.equity + netProfit)) < 0.01
                      ? "✓ Balance Sheet is balanced"
                      : `⚠ Difference: ${formatCurrency(Math.abs(totals.assets - (totals.liabilities + totals.equity + netProfit)))}`
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
