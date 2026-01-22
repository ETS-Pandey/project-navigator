import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import { Plus, Search, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSchemeEnrollments, useSchemes, useCreateEnrollment } from "@/hooks/useSchemes";
import { useCustomers } from "@/hooks/useCustomers";
import { formatCurrency } from "@/lib/formatters";
import { EnrollmentForm } from "@/components/schemes/EnrollmentForm";
import type { EnrollmentFormData, EnrollmentStatus } from "@/types/schemes";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  matured: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  defaulted: "bg-orange-100 text-orange-800",
};

export default function Enrollments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<EnrollmentStatus>('active');

  const { data: enrollments = [], isLoading } = useSchemeEnrollments({ status: activeTab });
  const { data: schemes = [] } = useSchemes('active');
  const { data: customers = [] } = useCustomers();
  const createEnrollment = useCreateEnrollment();

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.scheme?.scheme_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = async (data: EnrollmentFormData) => {
    await createEnrollment.mutateAsync(data);
    setShowEnrollDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheme Enrollments</h1>
          <p className="text-muted-foreground">Manage customer enrollments in savings schemes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/schemes/payments")}>
            <Calendar className="mr-2 h-4 w-4" />
            Due Payments
          </Button>
          <Button onClick={() => setShowEnrollDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Enrollment
          </Button>
        </div>
      </div>

      {/* Enrollments List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Enrollments</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search enrollments..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EnrollmentStatus)}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="matured">Matured</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredEnrollments.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No enrollments found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Scheme</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead>Maturity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => {
                      const progress = enrollment.scheme?.duration_months
                        ? (enrollment.installments_paid / enrollment.scheme.duration_months) * 100
                        : 0;
                      const daysToMaturity = differenceInDays(
                        parseISO(enrollment.maturity_date),
                        new Date()
                      );
                      const isNearMaturity = daysToMaturity <= 30 && daysToMaturity > 0;

                      return (
                        <TableRow
                          key={enrollment.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/schemes/enrollments/${enrollment.id}`)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{enrollment.enrollment_number}</p>
                              <p className="text-xs text-muted-foreground">
                                Started {format(parseISO(enrollment.start_date), "dd MMM yyyy")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{enrollment.customer?.name}</p>
                              <p className="text-xs text-muted-foreground">{enrollment.customer?.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{enrollment.scheme?.scheme_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(enrollment.monthly_amount)}/month
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={progress} className="h-2 w-24" />
                              <p className="text-xs text-muted-foreground">
                                {enrollment.installments_paid}/{enrollment.scheme?.duration_months} paid
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(enrollment.total_paid)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isNearMaturity && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                              {enrollment.status === 'matured' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                              <span className={isNearMaturity ? "text-orange-600" : ""}>
                                {format(parseISO(enrollment.maturity_date), "dd MMM yyyy")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[enrollment.status]}>
                              {enrollment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Enrollment</DialogTitle>
          </DialogHeader>
          <EnrollmentForm
            schemes={schemes}
            customers={customers}
            onSubmit={handleEnroll}
            isLoading={createEnrollment.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
