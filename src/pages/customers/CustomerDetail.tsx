import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Receipt,
  Gift,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/billing/CustomerForm";
import { useCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import { useCustomerInvoices, useCustomerPayments } from "@/hooks/useCustomerHistory";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { CustomerFormData } from "@/types/billing";

const typeColors: Record<string, string> = {
  retail: "bg-blue-500",
  wholesale: "bg-purple-500",
  corporate: "bg-orange-500",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  confirmed: "bg-blue-500",
  paid: "bg-green-500",
  partially_paid: "bg-yellow-500",
  cancelled: "bg-red-500",
};

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { data: customer, isLoading } = useCustomer(id || "");
  const { data: invoices = [] } = useCustomerInvoices(id || "");
  const { data: payments = [] } = useCustomerPayments(id || "");
  const updateCustomer = useUpdateCustomer();
  
  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!id) return;
    await updateCustomer.mutateAsync({ id, data });
    setShowEditDialog(false);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Customer not found</h1>
        </div>
      </div>
    );
  }
  
  // Calculate stats
  const totalPurchases = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);
  const totalPayments = payments.reduce((sum, pay) => sum + Number(pay.amount), 0);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <Badge className={typeColors[customer.customer_type]}>{customer.customer_type}</Badge>
              <Badge variant={customer.is_active ? "default" : "secondary"}>
                {customer.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{customer.customer_code}</p>
          </div>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {(customer.address || customer.city) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      {customer.address && <p>{customer.address}</p>}
                      <p>
                        {[customer.city, customer.state, customer.pincode].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {customer.date_of_birth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>DOB: {formatDate(customer.date_of_birth)}</span>
                  </div>
                )}
                {customer.anniversary && (
                  <div className="flex items-center gap-3">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <span>Anniversary: {formatDate(customer.anniversary)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Tax Information */}
          {(customer.gstin || customer.pan || customer.aadhar) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tax & Identity</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                {customer.gstin && (
                  <div>
                    <p className="text-sm text-muted-foreground">GSTIN</p>
                    <p className="font-medium">{customer.gstin}</p>
                  </div>
                )}
                {customer.pan && (
                  <div>
                    <p className="text-sm text-muted-foreground">PAN</p>
                    <p className="font-medium">{customer.pan}</p>
                  </div>
                )}
                {customer.aadhar && (
                  <div>
                    <p className="text-sm text-muted-foreground">Aadhar</p>
                    <p className="font-medium">{customer.aadhar}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Purchase History */}
          <Tabs defaultValue="invoices">
            <TabsList>
              <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
              <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="invoices">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No invoices yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoices.map((invoice) => (
                          <TableRow
                            key={invoice.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                          >
                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                            <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(invoice.grand_total)}</TableCell>
                            <TableCell className="text-right">
                              <span className={Number(invoice.balance_due) > 0 ? "text-destructive" : ""}>
                                {formatCurrency(invoice.balance_due || 0)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No payments yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.payment_number}</TableCell>
                            <TableCell>{formatDate(payment.payment_date)}</TableCell>
                            <TableCell className="capitalize">{payment.payment_mode.replace("_", " ")}</TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                                {payment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credit Limit</span>
                <span className="font-medium">{formatCurrency(customer.credit_limit || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding</span>
                <span className={`font-medium ${Number(customer.outstanding_balance) > 0 ? "text-destructive" : ""}`}>
                  {formatCurrency(customer.outstanding_balance || 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Credit</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(Math.max(0, (customer.credit_limit || 0) - (customer.outstanding_balance || 0)))}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Purchases</span>
                <span className="font-medium">{formatCurrency(totalPurchases)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Payments</span>
                <span className="font-medium">{formatCurrency(totalPayments)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loyalty Points</span>
                <span className="font-medium text-amber-600">{customer.loyalty_points || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Notes */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/billing/new")}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/billing/quotations/new")}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Create Quotation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={customer}
            onSubmit={handleUpdateCustomer}
            isLoading={updateCustomer.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
