import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { format, parseISO, isAfter } from "date-fns";
import { ArrowLeft, Printer, CreditCard, Package, History, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoan, useLoanPayments, getDaysOverdue } from "@/hooks/useLoans";
import { formatCurrency, formatWeight } from "@/lib/formatters";
import { LoanPaymentDialog } from "@/components/loans/LoanPaymentDialog";
import { LoanAgreementPrintTemplate } from "@/components/loans/LoanAgreementPrintTemplate";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  defaulted: "bg-red-100 text-red-800",
};

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const { data: loan, isLoading } = useLoan(id);
  const { data: payments = [] } = useLoanPayments(id);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `LoanAgreement-${loan?.loan_number || ""}`,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loan not found</p>
        <Button onClick={() => navigate("/loans/active")} className="mt-4">
          Back to Loans
        </Button>
      </div>
    );
  }

  const isOverdue = loan.status === 'active' && isAfter(new Date(), parseISO(loan.due_date));
  const daysOverdue = getDaysOverdue(loan.due_date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/loans/active")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{loan.loan_number}</h1>
              <Badge className={statusColors[loan.status]}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {daysOverdue} days overdue
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Created on {format(parseISO(loan.created_at), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handlePrint()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Agreement
          </Button>
          {loan.status === 'active' && (
            <Button onClick={() => setPaymentDialogOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Loan Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(loan.loan_amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(loan.outstanding_total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Collateral Value</p>
            <p className="text-2xl font-bold">{formatCurrency(loan.collateral_value)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className={`text-2xl font-bold ${isOverdue ? "text-red-600" : ""}`}>
              {format(parseISO(loan.due_date), "dd MMM yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="collaterals">
            <TabsList>
              <TabsTrigger value="collaterals">
                <Package className="mr-2 h-4 w-4" />
                Collaterals
              </TabsTrigger>
              <TabsTrigger value="payments">
                <History className="mr-2 h-4 w-4" />
                Payments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="collaterals" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Metal</TableHead>
                        <TableHead className="text-right">Net Wt.</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loan.collaterals?.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.item_description}</TableCell>
                          <TableCell>{c.purity} {c.metal_type}</TableCell>
                          <TableCell className="text-right">{formatWeight(c.net_weight)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(c.rate_per_gram)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(c.item_value)}</TableCell>
                          <TableCell>
                            <Badge variant={c.is_released ? "secondary" : "default"}>
                              {c.is_released ? "Released" : "Pledged"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {payments.length === 0 ? (
                    <p className="p-6 text-center text-muted-foreground">No payments recorded</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Receipt #</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Mode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{format(parseISO(p.payment_date), "dd MMM yyyy")}</TableCell>
                            <TableCell className="font-medium">{p.payment_number}</TableCell>
                            <TableCell className="capitalize">{p.payment_type.replace("_", " ")}</TableCell>
                            <TableCell className="text-right">{formatCurrency(p.amount)}</TableCell>
                            <TableCell className="capitalize">{p.payment_mode.replace("_", " ")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Customer & Loan Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{loan.customer?.name}</p>
              <p className="text-muted-foreground">{loan.customer?.phone}</p>
              <p className="text-muted-foreground">{loan.customer?.customer_code}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Loan Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span>{loan.interest_rate}% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Type</span>
                <span className="capitalize">{loan.interest_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenure</span>
                <span>{loan.tenure_months} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LTV</span>
                <span>{loan.ltv_percent.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {loan && (
        <>
          <LoanPaymentDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            loan={loan}
          />
          
          {/* Hidden Print Template */}
          <div className="hidden">
            <LoanAgreementPrintTemplate ref={printRef} loan={loan} />
          </div>
        </>
      )}
    </div>
  );
}
