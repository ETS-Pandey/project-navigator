import { useState } from "react";
import { useSalaryRecords, useCreateSalaryRecord, useProcessSalary, useSalaryStats } from "@/hooks/usePayroll";
import { useStaff } from "@/hooks/useStaff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, CreditCard, Clock, CheckCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const salaryFormSchema = z.object({
  staff_id: z.string().min(1, "Select staff member"),
  salary_month: z.string().min(1, "Select month"),
  days_worked: z.coerce.number().min(0).max(31),
  days_in_month: z.coerce.number().min(28).max(31),
  basic_salary: z.coerce.number().min(0),
  hra: z.coerce.number().optional(),
  da: z.coerce.number().optional(),
  other_allowances: z.coerce.number().optional(),
  overtime_hours: z.coerce.number().optional(),
  overtime_amount: z.coerce.number().optional(),
  bonus: z.coerce.number().optional(),
  commission: z.coerce.number().optional(),
  pf_deduction: z.coerce.number().optional(),
  esi_deduction: z.coerce.number().optional(),
  professional_tax: z.coerce.number().optional(),
  tds: z.coerce.number().optional(),
  loan_deduction: z.coerce.number().optional(),
  other_deductions: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type SalaryFormData = z.infer<typeof salaryFormSchema>;

export default function Payroll() {
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState("bank_transfer");
  const [paymentRef, setPaymentRef] = useState("");
  
  const { data: salaryRecords = [], isLoading } = useSalaryRecords(selectedMonth);
  const { data: stats } = useSalaryStats(selectedMonth);
  const { data: staffList = [] } = useStaff();
  const createSalary = useCreateSalaryRecord();
  const processSalary = useProcessSalary();
  
  const form = useForm<SalaryFormData>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      staff_id: "",
      salary_month: currentMonth,
      days_worked: 30,
      days_in_month: 30,
      basic_salary: 0,
      hra: 0,
      da: 0,
      other_allowances: 0,
      overtime_hours: 0,
      overtime_amount: 0,
      bonus: 0,
      commission: 0,
      pf_deduction: 0,
      esi_deduction: 0,
      professional_tax: 0,
      tds: 0,
      loan_deduction: 0,
      other_deductions: 0,
      notes: "",
    },
  });
  
  const onSubmit = async (data: SalaryFormData) => {
    await createSalary.mutateAsync({
      staff_id: data.staff_id,
      salary_month: data.salary_month,
      days_worked: data.days_worked,
      days_in_month: data.days_in_month,
      basic_salary: data.basic_salary,
      hra: data.hra,
      da: data.da,
      other_allowances: data.other_allowances,
      overtime_hours: data.overtime_hours,
      overtime_amount: data.overtime_amount,
      bonus: data.bonus,
      commission: data.commission,
      pf_deduction: data.pf_deduction,
      esi_deduction: data.esi_deduction,
      professional_tax: data.professional_tax,
      tds: data.tds,
      loan_deduction: data.loan_deduction,
      other_deductions: data.other_deductions,
      notes: data.notes,
    });
    setIsNewDialogOpen(false);
    form.reset();
  };
  
  const handlePaySalary = async () => {
    if (!selectedSalaryId) return;
    await processSalary.mutateAsync({
      salaryId: selectedSalaryId,
      paymentMode,
      paymentReference: paymentRef,
    });
    setIsPayDialogOpen(false);
    setSelectedSalaryId(null);
    setPaymentRef("");
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Paid</Badge>;
      case "processed":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="mr-1 h-3 w-3" />Processed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    }
  };
  
  // Generate last 12 months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7) + "-01";
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground">Manage staff salaries and payments</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Salary
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Salary Record</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="staff_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Member *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {staffList.map((staff) => (
                              <SelectItem key={staff.user_id} value={staff.user_id}>
                                {staff.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salary_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Month *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {format(new Date(month), "MMMM yyyy")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="days_in_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days in Month</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="days_worked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days Worked</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="basic_salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basic Salary (₹) *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Earnings */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Earnings</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="hra"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HRA</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="da"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DA</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="other_allowances"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Allowances</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bonus</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Deductions */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Deductions</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="pf_deduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PF</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="esi_deduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ESI</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="professional_tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Tax</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TDS</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSalary.isPending}>
                    Create Salary
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalPayroll || 0)}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalRecords || 0} records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.paidAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">{stats?.paidCount || 0} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(stats?.pendingAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">{stats?.pendingCount || 0} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month), "MMM yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      {/* Pay Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Salary Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Payment Mode</label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Reference Number</label>
              <Input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Transaction/Cheque number"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePaySalary} disabled={processSalary.isPending}>
                Mark as Paid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Salary Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Records - {format(new Date(selectedMonth), "MMMM yyyy")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Days</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : salaryRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No salary records for this month
                  </TableCell>
                </TableRow>
              ) : (
                salaryRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.staff?.full_name || "Unknown Staff"}
                    </TableCell>
                    <TableCell>{record.days_worked}/{record.days_in_month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.gross_salary)}</TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(record.total_deductions || 0)}
                    </TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(record.net_salary)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.status === "pending" && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedSalaryId(record.id);
                            setIsPayDialogOpen(true);
                          }}
                        >
                          Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
