import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Receipt, FileText, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInvoices } from "@/hooks/useInvoices";
import { useQuotations } from "@/hooks/useQuotations";
import { formatCurrency, formatDate } from "@/lib/formatters";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  confirmed: "bg-blue-500",
  paid: "bg-green-500",
  partially_paid: "bg-yellow-500",
  cancelled: "bg-red-500",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-gray-500",
  converted: "bg-purple-500",
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: quotations = [], isLoading: quotationsLoading } = useQuotations();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/billing/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.reduce((sum, inv) => sum + Number(inv.balance_due), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.filter(q => !["converted", "rejected", "expired"].includes(q.status)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices yet</TableCell></TableRow>
                  ) : (
                    invoices.slice(0, 20).map((invoice) => (
                      <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                        <TableCell>{invoice.customer_name || invoice.customer?.name || "Walk-in"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.grand_total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.balance_due)}</TableCell>
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

        <TabsContent value="quotations">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotationsLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : quotations.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No quotations yet</TableCell></TableRow>
                  ) : (
                    quotations.slice(0, 20).map((quotation) => (
                      <TableRow key={quotation.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                        <TableCell>{formatDate(quotation.quotation_date)}</TableCell>
                        <TableCell>{quotation.customer_name || quotation.customer?.name || "—"}</TableCell>
                        <TableCell>{quotation.valid_until ? formatDate(quotation.valid_until) : "—"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(quotation.grand_total)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[quotation.status]}>{quotation.status}</Badge>
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
  );
}
