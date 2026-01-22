import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import { ArrowLeft, Printer, CreditCard, Gift, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useSchemeEnrollment, useSchemePayments } from "@/hooks/useSchemes";
import { formatCurrency } from "@/lib/formatters";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  matured: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  defaulted: "bg-orange-100 text-orange-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  waived: "bg-gray-100 text-gray-800",
};

export default function EnrollmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: enrollment, isLoading } = useSchemeEnrollment(id);
  const { data: payments = [] } = useSchemePayments(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Enrollment not found</p>
        <Button onClick={() => navigate("/schemes/enrollments")} className="mt-4">
          Back to Enrollments
        </Button>
      </div>
    );
  }

  const progress = enrollment.scheme?.duration_months
    ? (enrollment.installments_paid / enrollment.scheme.duration_months) * 100
    : 0;
  const daysToMaturity = differenceInDays(parseISO(enrollment.maturity_date), new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/schemes/enrollments")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{enrollment.enrollment_number}</h1>
              <Badge className={statusColors[enrollment.status]}>
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Enrolled on {format(parseISO(enrollment.enrollment_date), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Statement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(enrollment.total_paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(enrollment.total_due - enrollment.total_paid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bonus Amount</p>
            <p className="text-2xl font-bold text-primary">
              {enrollment.bonus_earned ? (
                <span className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  {formatCurrency(enrollment.bonus_amount)}
                </span>
              ) : (
                formatCurrency(enrollment.bonus_amount)
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Maturity</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              {enrollment.status === 'matured' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Matured
                </>
              ) : daysToMaturity > 0 ? (
                <>
                  <Clock className="h-5 w-5" />
                  {daysToMaturity}d
                </>
              ) : (
                "Overdue"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{enrollment.installments_paid} of {enrollment.scheme?.duration_months} installments paid</span>
                  <span className="font-medium">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.installment_number}</TableCell>
                      <TableCell>{format(parseISO(payment.due_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        {payment.payment_date
                          ? format(parseISO(payment.payment_date), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'paid'
                          ? formatCurrency(payment.amount_paid)
                          : formatCurrency(payment.amount_due)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_mode?.replace("_", " ") || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentStatusColors[payment.status]}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{enrollment.customer?.name}</p>
              <p className="text-muted-foreground">{enrollment.customer?.phone}</p>
              <p className="text-muted-foreground">{enrollment.customer?.customer_code}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scheme Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheme</span>
                <span className="font-medium">{enrollment.scheme?.scheme_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly</span>
                <span>{formatCurrency(enrollment.monthly_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>{enrollment.scheme?.duration_months} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span>{format(parseISO(enrollment.start_date), "dd MMM yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maturity Date</span>
                <span>{format(parseISO(enrollment.maturity_date), "dd MMM yyyy")}</span>
              </div>
            </CardContent>
          </Card>

          {enrollment.status === 'matured' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Payout Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Total Deposited</span>
                  <span className="font-medium">{formatCurrency(enrollment.total_paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Bonus Earned</span>
                  <span className="font-medium text-green-700">+{formatCurrency(enrollment.bonus_amount)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium text-green-700">Total Payout</span>
                  <span className="font-bold text-green-700">{formatCurrency(enrollment.payout_amount)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
