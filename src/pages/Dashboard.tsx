import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Package, 
  Users, 
  AlertTriangle,
  Plus,
  Receipt,
  Coins,
  UserPlus,
  Landmark,
  Tag,
  Wallet,
  Eye
} from "lucide-react";
import { useRates } from "@/contexts/RateContext";
import { useBranch } from "@/contexts/BranchContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { rates, isLoading: ratesLoading, error: ratesError } = useRates();
  const { currentBranch } = useBranch();

  // Mock data for demonstration
  const salesData = {
    today: 245000,
    todayCount: 5,
    week: 1250000,
    month: 4850000,
    monthComparison: 12.5,
  };

  const financialData = {
    cashBalance: 185000,
    bankBalance: 2450000,
    receivables: 320000,
    payables: 145000,
  };

  const alerts = [
    { type: "warning", message: "5 items below minimum stock", link: "/inventory/products" },
    { type: "error", message: "3 customer payments overdue", link: "/customers" },
    { type: "info", message: "2 loan EMIs due today", link: "/loans/collections" },
    { type: "warning", message: "4 repairs ready for pickup", link: "/orders/repairs" },
  ];

  const quickActions = [
    { label: "New Sale", icon: Receipt, href: "/billing/new", color: "bg-primary" },
    { label: "Add Stock", icon: Plus, href: "/inventory/stock", color: "bg-success" },
    { label: "Old Gold", icon: Coins, href: "/billing/old-gold", color: "bg-warning" },
    { label: "New Customer", icon: UserPlus, href: "/customers/new", color: "bg-info" },
    { label: "New Loan", icon: Landmark, href: "/loans/new", color: "bg-burgundy" },
    { label: "Print Labels", icon: Tag, href: "/inventory/barcodes", color: "bg-muted-foreground" },
    { label: "Record Expense", icon: Wallet, href: "/expenses/new", color: "bg-destructive" },
    { label: "View Catalog", icon: Eye, href: "/catalog", color: "bg-accent-foreground" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at {currentBranch?.name || "your shop"} today.
          </p>
        </div>
        <Button asChild>
          <Link to="/rates">
            <TrendingUp className="mr-2 h-4 w-4" />
            Update Rates
          </Link>
        </Button>
      </div>

      {/* Rate Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardDescription>Gold 24K (per gram)</CardDescription>
          </CardHeader>
          <CardContent>
            {ratesLoading ? (
              <p className="text-lg text-muted-foreground">Loading...</p>
            ) : ratesError || !rates ? (
              <p className="text-sm text-destructive">No rates set today</p>
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(rates.gold_24k_sell)}</span>
                  <span className="text-sm text-muted-foreground">sell</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Buy: {formatCurrency(rates.gold_24k_buy)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary/70">
          <CardHeader className="pb-2">
            <CardDescription>Gold 22K (per gram)</CardDescription>
          </CardHeader>
          <CardContent>
            {ratesLoading ? (
              <p className="text-lg text-muted-foreground">Loading...</p>
            ) : ratesError || !rates?.gold_22k_sell ? (
              <p className="text-sm text-muted-foreground">Not set</p>
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(rates.gold_22k_sell)}</span>
                  <span className="text-sm text-muted-foreground">sell</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Buy: {formatCurrency(rates.gold_22k_buy || 0)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted-foreground">
          <CardHeader className="pb-2">
            <CardDescription>Silver 999 (per gram)</CardDescription>
          </CardHeader>
          <CardContent>
            {ratesLoading ? (
              <p className="text-lg text-muted-foreground">Loading...</p>
            ) : ratesError || !rates?.silver_999_sell ? (
              <p className="text-sm text-muted-foreground">Not set</p>
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(rates.silver_999_sell)}</span>
                  <span className="text-sm text-muted-foreground">sell</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Buy: {formatCurrency(rates.silver_999_buy || 0)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-2">
            <CardDescription>Rate Updated</CardDescription>
          </CardHeader>
          <CardContent>
            {rates ? (
              <div className="text-lg font-semibold">
                {formatRelativeTime(rates.updated_at)}
              </div>
            ) : (
              <Button size="sm" asChild>
                <Link to="/rates">Set Today's Rates</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.today)}</div>
            <p className="text-xs text-muted-foreground">
              {salesData.todayCount} invoice(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.week)}</div>
            <p className="text-xs text-muted-foreground">7 day total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            {salesData.monthComparison >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.month)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={salesData.monthComparison >= 0 ? "text-success" : "text-destructive"}>
                {salesData.monthComparison >= 0 ? "+" : ""}
                {salesData.monthComparison}%
              </span>{" "}
              vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.cashBalance)}</div>
            <p className="text-xs text-muted-foreground">In hand</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <Link
                key={index}
                to={alert.link}
                className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <Badge
                  variant={
                    alert.type === "error"
                      ? "destructive"
                      : alert.type === "warning"
                      ? "default"
                      : "secondary"
                  }
                  className="mt-0.5"
                >
                  {alert.type}
                </Badge>
                <span className="text-sm">{alert.message}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  asChild
                >
                  <Link to={action.href}>
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cash in Hand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(financialData.cashBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bank Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(financialData.bankBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Receivables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-success">{formatCurrency(financialData.receivables)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-destructive">{formatCurrency(financialData.payables)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
