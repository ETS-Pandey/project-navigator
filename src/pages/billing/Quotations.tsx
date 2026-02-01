import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuotations, useUpdateQuotationStatus, useConvertQuotationToInvoice } from "@/hooks/useQuotations";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { QuotationStatus } from "@/types/billing";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-gray-500",
  converted: "bg-purple-500",
};

export default function Quotations() {
  const navigate = useNavigate();
  const { data: quotations = [], isLoading } = useQuotations();
  const updateStatus = useUpdateQuotationStatus();
  const convertToInvoice = useConvertQuotationToInvoice();

  const handleStatusChange = async (id: string, status: QuotationStatus) => {
    await updateStatus.mutateAsync({ id, status });
  };

  const handleConvert = async (id: string) => {
    const invoice = await convertToInvoice.mutateAsync(id);
    navigate("/billing/invoices");
  };

  const activeQuotations = quotations.filter(
    (q) => !["converted", "rejected", "expired"].includes(q.status)
  );
  const totalValue = activeQuotations.reduce((sum, q) => sum + Number(q.grand_total), 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quotations</h1>
        <Button onClick={() => navigate("/billing/quotations/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Quotation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuotations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No quotations yet. Create your first quotation!
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((quotation) => (
                  <TableRow 
                    key={quotation.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/billing/quotations/${quotation.id}`)}
                  >
                    <TableCell className="font-medium">
                      {quotation.quotation_number}
                    </TableCell>
                    <TableCell>{formatDate(quotation.quotation_date)}</TableCell>
                    <TableCell>
                      {quotation.customer_name || quotation.customer?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {quotation.valid_until ? formatDate(quotation.valid_until) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(quotation.grand_total)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[quotation.status]}>
                        {quotation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {quotation.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(quotation.id, "sent")}
                            >
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {quotation.status === "sent" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(quotation.id, "accepted")}
                              >
                                Mark Accepted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(quotation.id, "rejected")}
                              >
                                Mark Rejected
                              </DropdownMenuItem>
                            </>
                          )}
                          {(quotation.status === "accepted" || quotation.status === "sent") && (
                            <DropdownMenuItem
                              onClick={() => handleConvert(quotation.id)}
                              disabled={convertToInvoice.isPending}
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Convert to Invoice
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
