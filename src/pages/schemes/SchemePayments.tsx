import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isBefore, isToday } from "date-fns";
import { CreditCard, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePendingSchemePayments, useRecordSchemePayment } from "@/hooks/useSchemes";
import { formatCurrency } from "@/lib/formatters";
import { SchemePaymentForm } from "@/components/schemes/SchemePaymentForm";
import type { SchemePaymentFormData } from "@/types/schemes";

export default function SchemePayments() {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<{
    id: string;
    enrollmentId: string;
    amount: number;
  } | null>(null);

  const { data: pendingPayments = [], isLoading } = usePendingSchemePayments();
  const recordPayment = useRecordSchemePayment();

  const handleRecordPayment = async (data: SchemePaymentFormData) => {
    if (!selectedPayment) return;
    
    await recordPayment.mutateAsync({
      paymentId: selectedPayment.id,
      enrollmentId: selectedPayment.enrollmentId,
      data,
    });
    setSelectedPayment(null);
  };

  // Group payments by status
  const overduePayments = pendingPayments.filter(
    (p) => p.status === 'overdue' || isBefore(parseISO(p.due_date), new Date())
  );
  const dueToday = pendingPayments.filter((p) => isToday(parseISO(p.due_date)));
  const upcoming = pendingPayments.filter(
    (p) => !isBefore(parseISO(p.due_date), new Date()) && !isToday(parseISO(p.due_date))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Due Payments</h1>
          <p className="text-muted-foreground">Track and collect scheme installments</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/schemes/enrollments")}>
          View Enrollments
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-700">{overduePayments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-orange-100 p-3">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600">Due Today</p>
              <p className="text-2xl font-bold text-orange-700">{dueToday.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-700">{upcoming.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">No pending payments at the moment.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Scheme</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map((payment: any) => {
                  const isOverdue = isBefore(parseISO(payment.due_date), new Date());
                  const isDueToday = isToday(parseISO(payment.due_date));

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.enrollment?.enrollment_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{payment.enrollment?.customer?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.enrollment?.customer?.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.enrollment?.scheme?.scheme_name}</TableCell>
                      <TableCell>#{payment.installment_number}</TableCell>
                      <TableCell>
                        <span className={cn(
                          isOverdue && "text-red-600 font-medium",
                          isDueToday && "text-orange-600 font-medium"
                        )}>
                          {format(parseISO(payment.due_date), "dd MMM yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount_due)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isOverdue ? "destructive" : isDueToday ? "outline" : "secondary"}
                        >
                          {isOverdue ? "Overdue" : isDueToday ? "Due Today" : "Upcoming"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => setSelectedPayment({
                            id: payment.id,
                            enrollmentId: payment.enrollment_id,
                            amount: payment.amount_due,
                          })}
                        >
                          Collect
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <SchemePaymentForm
              amount={selectedPayment.amount}
              onSubmit={handleRecordPayment}
              isLoading={recordPayment.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
