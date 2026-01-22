import { useNavigate } from "react-router-dom";
import { format, parseISO, isAfter, isSameDay } from "date-fns";
import { AlertTriangle, Clock, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLoans, getDaysOverdue } from "@/hooks/useLoans";
import { formatCurrency } from "@/lib/formatters";

export default function Collections() {
  const navigate = useNavigate();
  const { data: loans = [], isLoading } = useLoans({ status: "active" });

  const today = new Date();
  const overdueLoans = loans.filter(l => isAfter(today, parseISO(l.due_date)));
  const dueTodayLoans = loans.filter(l => isSameDay(today, parseISO(l.due_date)));
  const upcomingLoans = loans.filter(l => !isAfter(today, parseISO(l.due_date)) && !isSameDay(today, parseISO(l.due_date)));

  const overdueAmount = overdueLoans.reduce((sum, l) => sum + l.outstanding_total, 0);
  const dueTodayAmount = dueTodayLoans.reduce((sum, l) => sum + l.outstanding_total, 0);

  const LoanTable = ({ loanList, emptyMessage }: { loanList: typeof loans; emptyMessage: string }) => (
    loanList.length === 0 ? (
      <p className="p-6 text-center text-muted-foreground">{emptyMessage}</p>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loan #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Outstanding</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loanList.map((loan) => {
            const daysOverdue = getDaysOverdue(loan.due_date);
            return (
              <TableRow key={loan.id} className="cursor-pointer" onClick={() => navigate(`/loans/${loan.id}`)}>
                <TableCell className="font-medium">{loan.loan_number}</TableCell>
                <TableCell>{loan.customer?.name}</TableCell>
                <TableCell>{format(parseISO(loan.due_date), "dd MMM yyyy")}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(loan.outstanding_total)}</TableCell>
                <TableCell>
                  {daysOverdue > 0 ? (
                    <Badge variant="destructive">{daysOverdue}d overdue</Badge>
                  ) : (
                    <Badge variant="outline">On time</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground">Track loan dues and overdue accounts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{overdueLoans.length} loans</p>
                <p className="text-sm text-red-700">{formatCurrency(overdueAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700">Due Today</p>
                <p className="text-2xl font-bold text-orange-900">{dueTodayLoans.length} loans</p>
                <p className="text-sm text-orange-700">{formatCurrency(dueTodayAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{loans.length} loans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {overdueLoans.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-700">Overdue Loans</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LoanTable loanList={overdueLoans} emptyMessage="No overdue loans" />
          </CardContent>
        </Card>
      )}

      {dueTodayLoans.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-orange-700">Due Today</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LoanTable loanList={dueTodayLoans} emptyMessage="No loans due today" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Upcoming Dues</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LoanTable loanList={upcomingLoans.slice(0, 10)} emptyMessage="No upcoming dues" />
        </CardContent>
      </Card>
    </div>
  );
}
