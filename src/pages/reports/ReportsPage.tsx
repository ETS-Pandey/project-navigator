import { useState } from "react";
import { format } from "date-fns";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Wallet,
  CreditCard,
  ShoppingCart,
  Wrench,
  PiggyBank,
  Receipt,
  Scale,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useSystemStats, useMonthlySalesData, useTopCustomers, useCategorySales } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/formatters";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F", "#FFBB28"];

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const { data: stats, isLoading: loadingStats } = useSystemStats(dateFrom, dateTo);
  const { data: monthlyData = [], isLoading: loadingMonthly } = useMonthlySalesData();
  const { data: topCustomers = [] } = useTopCustomers(5);
  const { data: categorySales = [] } = useCategorySales();

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const netProfit = (stats?.totalSales || 0) - (stats?.totalExpenses || 0);
  const profitMargin = stats?.totalSales ? (netProfit / stats.totalSales) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Reports</h1>
            <p className="text-muted-foreground">Complete visibility into all system data</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Date Filter */}
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
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
            </Button>
            <Button variant="outline" size="sm">This Quarter</Button>
            <Button variant="outline" size="sm">This Year</Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Sales</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(stats?.totalSales || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats?.salesCount} invoices
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Expenses</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(stats?.totalExpenses || 0)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {stats?.expenseCount} entries
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-emerald-50 to-emerald-100/50 border-emerald-200' : 'from-orange-50 to-orange-100/50 border-orange-200'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${netProfit >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                  Net {netProfit >= 0 ? 'Profit' : 'Loss'}
                </p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-800' : 'text-orange-800'}`}>
                  {formatCurrency(Math.abs(netProfit))}
                </p>
                <p className={`text-xs mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {profitMargin.toFixed(1)}% margin
                </p>
              </div>
              <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-emerald-200' : 'bg-orange-200'}`}>
                <Scale className={`h-6 w-6 ${netProfit >= 0 ? 'text-emerald-700' : 'text-orange-700'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Stock Value</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(stats?.totalStockValue || 0)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats?.availableProducts} items
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Package className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="schemes">Schemes</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Monthly Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales vs Expenses Trend</CardTitle>
              <CardDescription>Last 6 months performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="sales" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Sales" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Expenses" />
                    <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Purchases</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((customer, idx) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground w-5">
                              #{idx + 1}
                            </span>
                            {customer.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.totalPurchases)}
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.invoiceCount}
                        </TableCell>
                      </TableRow>
                    ))}
                    {topCustomers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No customer data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Sales by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categorySales.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySales}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categorySales.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No category data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard
              icon={Users}
              label="Customers"
              value={stats?.totalCustomers || 0}
              subValue={`${stats?.activeCustomers || 0} active`}
              color="blue"
            />
            <StatCard
              icon={Receipt}
              label="GST Collected"
              value={formatCurrency(stats?.totalGstCollected || 0)}
              color="purple"
            />
            <StatCard
              icon={CreditCard}
              label="Receivables"
              value={formatCurrency(stats?.totalOutstandingReceivables || 0)}
              color="orange"
            />
            <StatCard
              icon={Wallet}
              label="Loan Outstanding"
              value={formatCurrency(stats?.totalOutstandingLoans || 0)}
              subValue={`${stats?.activeLoans || 0} active`}
              color="cyan"
            />
            <StatCard
              icon={PiggyBank}
              label="Scheme Collected"
              value={formatCurrency(stats?.totalSchemeCollected || 0)}
              subValue={`${stats?.activeEnrollments || 0} enrolled`}
              color="emerald"
            />
            <StatCard
              icon={Coins}
              label="Old Gold Bought"
              value={formatCurrency(stats?.oldGoldValue || 0)}
              subValue={`${(stats?.oldGoldWeight || 0).toFixed(2)}g`}
              color="yellow"
            />
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(stats?.totalSales || 0)}
              icon={TrendingUp}
              trend={12}
            />
            <MetricCard
              title="Average Invoice"
              value={formatCurrency(stats?.avgInvoiceValue || 0)}
              icon={Receipt}
            />
            <MetricCard
              title="Total Collections"
              value={formatCurrency(stats?.totalPayments || 0)}
              icon={ArrowUpRight}
              iconColor="text-green-600"
            />
            <MetricCard
              title="Pending Payments"
              value={formatCurrency(stats?.pendingAmount || 0)}
              icon={ArrowDownRight}
              iconColor="text-red-600"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Collection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Collection Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.totalSales ? ((stats.paidAmount / stats.totalSales) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats?.totalSales ? (stats.paidAmount / stats.totalSales) * 100 : 0}
                      className="h-3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Collected</p>
                      <p className="text-xl font-bold text-green-800">
                        {formatCurrency(stats?.paidAmount || 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">Pending</p>
                      <p className="text-xl font-bold text-red-800">
                        {formatCurrency(stats?.pendingAmount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payments by Mode</CardTitle>
                <CardDescription>{stats?.paymentsCount || 0} total payments received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-700" />
                      <span className="text-sm font-medium text-green-700">Cash</span>
                    </div>
                    <span className="font-bold text-green-800">{formatCurrency(stats?.cashPayments || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-700" />
                      <span className="text-sm font-medium text-blue-700">Card</span>
                    </div>
                    <span className="font-bold text-blue-800">{formatCurrency(stats?.cardPayments || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-purple-700" />
                      <span className="text-sm font-medium text-purple-700">UPI</span>
                    </div>
                    <span className="font-bold text-purple-800">{formatCurrency(stats?.upiPayments || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-cyan-700" />
                      <span className="text-sm font-medium text-cyan-700">Bank Transfer</span>
                    </div>
                    <span className="font-bold text-cyan-800">{formatCurrency(stats?.bankTransferPayments || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Products"
              value={stats?.totalProducts || 0}
              icon={Package}
            />
            <MetricCard
              title="Available Stock"
              value={stats?.availableProducts || 0}
              icon={Package}
              iconColor="text-green-600"
            />
            <MetricCard
              title="Sold Items"
              value={stats?.soldProducts || 0}
              icon={ShoppingCart}
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Stock Value"
              value={formatCurrency(stats?.totalStockValue || 0)}
              icon={Wallet}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gold Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 mb-4">
                    <Coins className="h-12 w-12 text-yellow-600" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-700">
                    {(stats?.totalGoldWeight || 0).toFixed(2)} g
                  </p>
                  <p className="text-muted-foreground">Total Gold Weight</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Silver Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
                    <Coins className="h-12 w-12 text-gray-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-700">
                    {(stats?.totalSilverWeight || 0).toFixed(2)} g
                  </p>
                  <p className="text-muted-foreground">Total Silver Weight</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Active Loans"
              value={stats?.activeLoans || 0}
              icon={Wallet}
            />
            <MetricCard
              title="Total Disbursed"
              value={formatCurrency(stats?.totalLoanAmount || 0)}
              icon={CreditCard}
            />
            <MetricCard
              title="Outstanding"
              value={formatCurrency(stats?.totalOutstandingLoans || 0)}
              icon={TrendingUp}
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Collateral Value"
              value={formatCurrency(stats?.totalCollateralValue || 0)}
              icon={Scale}
              iconColor="text-green-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loan Health Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-200 rounded-full">
                      <TrendingDown className="h-6 w-6 text-red-700" />
                    </div>
                    <div>
                      <p className="text-sm text-red-700">Overdue Loans</p>
                      <p className="text-2xl font-bold text-red-800">
                        {stats?.overdueLoans || 0}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-red-700">
                    {formatCurrency(stats?.overdueAmount || 0)} at risk
                  </p>
                </div>

                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-200 rounded-full">
                      <Scale className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700">LTV Ratio</p>
                      <p className="text-2xl font-bold text-green-800">
                        {stats?.totalCollateralValue 
                          ? ((stats.totalOutstandingLoans / stats.totalCollateralValue) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-green-600">
                    Loan to Collateral Value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schemes Tab */}
        <TabsContent value="schemes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Active Enrollments"
              value={stats?.activeEnrollments || 0}
              icon={PiggyBank}
            />
            <MetricCard
              title="Total Collected"
              value={formatCurrency(stats?.totalSchemeCollected || 0)}
              icon={Wallet}
              iconColor="text-green-600"
            />
            <MetricCard
              title="Pending Dues"
              value={formatCurrency(stats?.pendingDues || 0)}
              icon={CreditCard}
              iconColor="text-orange-600"
            />
            <MetricCard
              title="Maturing This Month"
              value={stats?.maturingThisMonth || 0}
              icon={Calendar}
              iconColor="text-blue-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scheme Collection Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Collection vs Dues</span>
                    <span className="text-sm text-muted-foreground">
                      {stats?.totalSchemeCollected && stats.pendingDues
                        ? ((stats.totalSchemeCollected / (stats.totalSchemeCollected + stats.pendingDues)) * 100).toFixed(1)
                        : 100}%
                    </span>
                  </div>
                  <Progress
                    value={
                      stats?.totalSchemeCollected && stats.pendingDues
                        ? (stats.totalSchemeCollected / (stats.totalSchemeCollected + stats.pendingDues)) * 100
                        : 100
                    }
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Pending Repairs"
              value={stats?.pendingRepairs || 0}
              icon={Wrench}
              iconColor="text-orange-600"
            />
            <MetricCard
              title="Repair Revenue"
              value={formatCurrency(stats?.totalRepairRevenue || 0)}
              icon={TrendingUp}
              iconColor="text-green-600"
            />
            <MetricCard
              title="Custom Orders"
              value={stats?.pendingCustomOrders || 0}
              icon={Package}
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Custom Order Revenue"
              value={formatCurrency(stats?.totalCustomOrderRevenue || 0)}
              icon={TrendingUp}
              iconColor="text-green-600"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Repair Orders Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-5 w-5 text-orange-600" />
                      <span>Pending Repairs</span>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {stats?.pendingRepairs || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Revenue Generated</span>
                    </div>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(stats?.totalRepairRevenue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Orders Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span>Pending Orders</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {stats?.pendingCustomOrders || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Revenue Generated</span>
                    </div>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(stats?.totalCustomOrderRevenue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: "blue" | "green" | "red" | "purple" | "orange" | "cyan" | "emerald" | "yellow";
}

function StatCard({ icon: Icon, label, value, subValue, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
    cyan: "bg-cyan-50 text-cyan-700",
    emerald: "bg-emerald-50 text-emerald-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-lg font-bold">{value}</p>
        {subValue && <p className="text-xs opacity-80">{subValue}</p>}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  iconColor?: string;
}

function MetricCard({ title, value, icon: Icon, trend, iconColor = "text-primary" }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend !== undefined && (
              <p className={`text-xs mt-1 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {trend >= 0 ? "+" : ""}{trend}% vs last period
              </p>
            )}
          </div>
          <div className={`p-3 bg-muted rounded-full ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
