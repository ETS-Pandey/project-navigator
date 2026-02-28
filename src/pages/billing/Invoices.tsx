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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-3xl">Billing</h1>
        <Button size="sm" onClick={() => navigate("/billing/new")}>
          <Plus className="h-4 w-4 mr-1" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Total Invoices</CardTitle>
            <Receipt className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold sm:text-2xl">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Pending</CardTitle>
            <Coins className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold sm:text-2xl">
              {formatCurrency(invoices.reduce((sum, inv) => sum + Number(inv.balance_due), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Quotations</CardTitle>
            <FileText className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold sm:text-2xl">
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Invoice #</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-right text-xs">Amount</TableHead>
                      <TableHead className="text-right text-xs hidden md:table-cell">Balance</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm">Loading...</TableCell></TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No invoices yet</TableCell></TableRow>
                    ) : (
                      invoices.slice(0, 20).map((invoice) => (
                        <TableRow 
                          key={invoice.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                        >
                          <TableCell className="font-medium text-xs sm:text-sm">{invoice.invoice_number}</TableCell>
                          <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{formatDate(invoice.invoice_date)}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{invoice.customer_name || invoice.customer?.name || "Walk-in"}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(invoice.grand_total)}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm hidden md:table-cell">{formatCurrency(invoice.balance_due)}</TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[invoice.status]} text-[10px] sm:text-xs`}>{invoice.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Quotation #</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Valid Until</TableHead>
                      <TableHead className="text-right text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotationsLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm">Loading...</TableCell></TableRow>
                    ) : quotations.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No quotations yet</TableCell></TableRow>
                    ) : (
                      quotations.slice(0, 20).map((quotation) => (
                        <TableRow key={quotation.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium text-xs sm:text-sm">{quotation.quotation_number}</TableCell>
                          <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{formatDate(quotation.quotation_date)}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{quotation.customer_name || quotation.customer?.name || "—"}</TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">{quotation.valid_until ? formatDate(quotation.valid_until) : "—"}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(quotation.grand_total)}</TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[quotation.status]} text-[10px] sm:text-xs`}>{quotation.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
