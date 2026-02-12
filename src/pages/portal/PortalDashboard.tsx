import { Link, useNavigate } from "react-router-dom";
import { Gem, Receipt, Landmark, PiggyBank, LogOut, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useCustomerPortalAuth, useCustomerInvoices, useCustomerLoans, useCustomerSchemeEnrollments } from "@/hooks/useCustomerPortal";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const statusColor = (status: string) => {
  switch (status) {
    case "paid": case "closed": case "completed": return "default";
    case "active": return "secondary";
    case "overdue": case "defaulted": return "destructive";
    default: return "outline";
  }
};

export default function PortalDashboard() {
  const { customer, logout, isAuthenticated } = useCustomerPortalAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !customer) {
    navigate("/portal", { replace: true });
    return null;
  }

  const { data: invoices, isLoading: loadingInvoices } = useCustomerInvoices(customer.id);
  const { data: loans, isLoading: loadingLoans } = useCustomerLoans(customer.id);
  const { data: enrollments, isLoading: loadingEnrollments } = useCustomerSchemeEnrollments(customer.id);

  const handleLogout = () => {
    logout();
    navigate("/portal");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/catalog" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Gem className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">JewelPro</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{customer.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {/* Welcome Card */}
        <Card className="gold-gradient text-primary-foreground">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-xl font-bold">Welcome, {customer.name}</h1>
              <p className="text-sm opacity-80">Customer Code: {customer.customer_code}</p>
            </div>
            <div className="text-right">
              {customer.loyalty_points != null && customer.loyalty_points > 0 && (
                <div>
                  <p className="text-2xl font-bold">{customer.loyalty_points}</p>
                  <p className="text-xs opacity-80">Loyalty Points</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Receipt className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{invoices?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Purchases</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Landmark className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{loans?.filter((l) => l.status === "active").length || 0}</p>
                <p className="text-xs text-muted-foreground">Active Loans</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <PiggyBank className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{enrollments?.filter((e) => e.status === "active").length || 0}</p>
                <p className="text-xs text-muted-foreground">Active Schemes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="purchases">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="schemes">Schemes</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-3 pt-4">
            {loadingInvoices ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)
            ) : invoices?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No purchase history</p>
            ) : (
              invoices?.map((inv) => (
                <Card key={inv.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(inv.invoice_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(inv.grand_total)}</p>
                      <Badge variant={statusColor(inv.status)} className="capitalize">{inv.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="loans" className="space-y-3 pt-4">
            {loadingLoans ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : loans?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No loans</p>
            ) : (
              loans?.map((loan) => (
                <Card key={loan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{loan.loan_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(loan.loan_date)} • {loan.interest_rate}% p.a.</p>
                      </div>
                      <Badge variant={statusColor(loan.status)} className="capitalize">{loan.status}</Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Loan Amount</p>
                        <p className="font-medium">{formatCurrency(loan.loan_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Outstanding</p>
                        <p className="font-medium">{formatCurrency(loan.outstanding_total)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="font-medium">{formatDate(loan.due_date)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="schemes" className="space-y-3 pt-4">
            {loadingEnrollments ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : enrollments?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No scheme enrollments</p>
            ) : (
              enrollments?.map((enrollment: any) => (
                <Card key={enrollment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{enrollment.scheme?.scheme_name || enrollment.enrollment_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(enrollment.enrollment_date)}</p>
                      </div>
                      <Badge variant={statusColor(enrollment.status)} className="capitalize">{enrollment.status}</Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                        <p className="font-medium">{formatCurrency(enrollment.monthly_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Paid</p>
                        <p className="font-medium">{formatCurrency(enrollment.total_paid)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="font-medium">{enrollment.installments_paid}/{enrollment.installments_paid + enrollment.installments_remaining}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Link to="/catalog">
            <Button variant="outline">
              Browse Collection <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
