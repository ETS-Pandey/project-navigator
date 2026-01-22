import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isAfter } from "date-fns";
import {
  Landmark,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoans, useLoanStatistics, getDaysOverdue } from "@/hooks/useLoans";
import { formatCurrency } from "@/lib/formatters";
import type { LoanStatus } from "@/types/loans";

const statusColors: Record<LoanStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  defaulted: "bg-red-100 text-red-800",
  auctioned: "bg-purple-100 text-purple-800",
  renewed: "bg-blue-100 text-blue-800",
};

export default function ActiveLoans() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const { data: loans = [], isLoading } = useLoans({
    status: statusFilter === "all" ? undefined : (statusFilter as LoanStatus),
    search: search || undefined,
  });

  const { data: stats } = useLoanStatistics();

  const statCards = [
    {
      title: "Active Loans",
      value: stats?.totalActiveLoans || 0,
      icon: Landmark,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Outstanding",
      value: formatCurrency(stats?.totalOutstanding || 0),
      icon: IndianRupee,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Overdue Loans",
      value: stats?.overdueCount || 0,
      subValue: formatCurrency(stats?.overdueAmount || 0),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Due Today",
      value: stats?.dueTodayCount || 0,
      subValue: formatCurrency(stats?.dueTodayAmount || 0),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gold Loans</h1>
          <p className="text-sm text-muted-foreground">
            Manage gold loan accounts and track repayments
          </p>
        </div>
        <Button onClick={() => navigate("/loans/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Loan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Loan Accounts</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by loan number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 sm:w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                  <SelectItem value="renewed">Renewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Landmark className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No loans found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating a new gold loan"}
              </p>
              <Button onClick={() => navigate("/loans/new")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Loan
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Loan Amount</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const isOverdue = loan.status === 'active' && isAfter(new Date(), parseISO(loan.due_date));
                    const daysOverdue = getDaysOverdue(loan.due_date);

                    return (
                      <TableRow
                        key={loan.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/loans/${loan.id}`)}
                      >
                        <TableCell className="font-medium">
                          {loan.loan_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{loan.customer?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {loan.customer?.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(loan.loan_date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(loan.loan_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={loan.outstanding_total > 0 ? "text-orange-600 font-medium" : "text-green-600"}>
                            {formatCurrency(loan.outstanding_total)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                              {format(parseISO(loan.due_date), "dd MMM yyyy")}
                            </span>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                {daysOverdue}d overdue
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[loan.status]}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
