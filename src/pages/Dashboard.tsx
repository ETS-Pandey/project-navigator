import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  AlertTriangle,
  Plus,
  Receipt,
  Coins,
  UserPlus,
  Landmark,
  Tag,
  Wallet,
  Eye,
  Loader2,
  CreditCard
} from "lucide-react";
import { useRates } from "@/contexts/RateContext";
import { useBranch } from "@/contexts/BranchContext";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { rates, isLoading: ratesLoading, error: ratesError } = useRates();
  const { currentBranch } = useBranch();
  const { sales, financial, alerts, isLoading: statsLoading } = useDashboardStats();

  const quickActions = [
    { label: "New Sale", icon: Receipt, href: "/billing/new", color: "bg-primary" },
    { label: "Add Stock", icon: Plus, href: "/inventory/stock", color: "bg-success" },
    { label: "Old Gold", icon: Coins, href: "/billing/old-gold", color: "bg-warning" },
    { label: "New Customer", icon: UserPlus, href: "/customers/new", color: "bg-info" },
    { label: "New Loan", icon: Landmark, href: "/loans/new", color: "bg-burgundy" },
    { label: "Print Labels", icon: Tag, href: "/inventory/barcodes", color: "bg-muted-foreground" },
    { label: "Record Expense", icon: Wallet, href: "/expenses", color: "bg-destructive" },
    { label: "View Reports", icon: Eye, href: "/reports", color: "bg-accent-foreground" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's what's happening at {currentBranch?.name || "your shop"} today.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/rates">
            <TrendingUp className="mr-2 h-4 w-4" />
            Update Rates
          </Link>
        </Button>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Gold 24K (/g)</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {ratesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : ratesError || !rates ? (
              <p className="text-xs text-destructive">No rates set</p>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold sm:text-2xl">{formatCurrency(rates.gold_24k_sell)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Buy: {formatCurrency(rates.gold_24k_buy)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary/70">
          <CardHeader className="pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Gold 22K (/g)</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {ratesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : ratesError || !rates?.gold_22k_sell ? (
              <p className="text-xs text-muted-foreground">Not set</p>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold sm:text-2xl">{formatCurrency(rates.gold_22k_sell)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Buy: {formatCurrency(rates.gold_22k_buy || 0)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted-foreground">
          <CardHeader className="pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Silver 999 (/g)</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {ratesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : ratesError || !rates?.silver_999_sell ? (
              <p className="text-xs text-muted-foreground">Not set</p>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold sm:text-2xl">{formatCurrency(rates.silver_999_sell)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Buy: {formatCurrency(rates.silver_999_buy || 0)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Rate Updated</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {rates ? (
              <div className="text-base font-semibold sm:text-lg">
                {formatRelativeTime(rates.updated_at)}
              </div>
            ) : (
              <Button size="sm" asChild>
                <Link to="/rates">Set Rates</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Today's Sales</CardTitle>
            <IndianRupee className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-lg font-bold sm:text-2xl">{formatCurrency(sales?.today || 0)}</div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {sales?.todayCount || 0} invoice(s)
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Collections</CardTitle>
            <CreditCard className="h-3.5 w-3.5 text-success sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-lg font-bold text-success sm:text-2xl">{formatCurrency(financial?.todayPayments || 0)}</div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {financial?.todayPaymentCount || 0} payment(s)
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Expenses</CardTitle>
            <Wallet className="h-3.5 w-3.5 text-destructive sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-lg font-bold text-destructive sm:text-2xl">{formatCurrency(financial?.todayExpenses || 0)}</div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {financial?.todayExpenseCount || 0} expense(s)
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">This Week</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-success sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-lg font-bold sm:text-2xl">{formatCurrency(sales?.week || 0)}</div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">7 day total</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">This Month</CardTitle>
            {(sales?.monthComparison || 0) >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-success sm:h-4 sm:w-4" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive sm:h-4 sm:w-4" />
            )}
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-lg font-bold sm:text-2xl">{formatCurrency(sales?.month || 0)}</div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  <span className={(sales?.monthComparison || 0) >= 0 ? "text-success" : "text-destructive"}>
                    {(sales?.monthComparison || 0) >= 0 ? "+" : ""}
                    {sales?.monthComparison || 0}%
                  </span>{" "}
                  vs last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Month Collections</CardTitle>
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-lg font-bold sm:text-2xl">{formatCurrency(financial?.monthPayments || 0)}</div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">{financial?.monthPaymentCount || 0} payments</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Alerts Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6 space-y-2">
            {alerts.map((alert, index) => (
              <Link
                key={index}
                to={alert.link}
                className="flex items-start gap-2 rounded-lg p-2 hover:bg-muted/50 transition-colors"
              >
                <Badge
                  variant={
                    alert.type === "error"
                      ? "destructive"
                      : alert.type === "warning"
                      ? "default"
                      : "secondary"
                  }
                  className="mt-0.5 text-[10px]"
                >
                  {alert.type}
                </Badge>
                <span className="text-xs sm:text-sm">{alert.message}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto flex-col gap-1.5 py-3 px-1 sm:py-4 sm:gap-2"
                  asChild
                >
                  <Link to={action.href}>
                    <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-[10px] sm:text-xs text-center leading-tight">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Cash in Hand</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-base font-bold sm:text-xl">{formatCurrency(financial?.cashBalance || 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Bank Balance</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-base font-bold sm:text-xl">{formatCurrency(financial?.bankBalance || 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Receivables</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-base font-bold text-success sm:text-xl">{formatCurrency(financial?.receivables || 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Payables</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-base font-bold text-destructive sm:text-xl">{formatCurrency(financial?.payables || 0)}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
