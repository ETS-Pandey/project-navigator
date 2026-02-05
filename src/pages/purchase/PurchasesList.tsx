import { useState } from "react";
import { usePurchases, useConfirmPurchase, usePurchaseStats } from "@/hooks/usePurchases";
import { useVendors } from "@/hooks/useVendors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, ShoppingCart, Wallet, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";

const purchaseTypes = [
  { value: "bullion", label: "Bullion" },
  { value: "finished", label: "Finished Goods" },
  { value: "stones", label: "Stones" },
  { value: "consumables", label: "Consumables" },
  { value: "other", label: "Other" },
];

export default function PurchasesList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: purchases = [], isLoading } = usePurchases(statusFilter !== "all" ? statusFilter : undefined);
  const { data: stats } = usePurchaseStats();
  const confirmPurchase = useConfirmPurchase();
  
  const filteredPurchases = purchases.filter((purchase) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      purchase.purchase_number.toLowerCase().includes(searchLower) ||
      purchase.vendor?.name?.toLowerCase().includes(searchLower) ||
      purchase.invoice_number?.toLowerCase().includes(searchLower)
    );
  });
  
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      confirmed: "bg-blue-100 text-blue-800",
      partially_paid: "bg-amber-100 text-amber-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };
  
  const getTypeBadge = (type: string) => {
    const label = purchaseTypes.find((t) => t.value === type)?.label || type;
    return <Badge variant="outline" className="capitalize">{label}</Badge>;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">Manage purchase entries and vendor invoices</p>
        </div>
        <Link to="/purchase/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase
          </Button>
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalPurchases || 0)}</div>
            <p className="text-xs text-muted-foreground">{stats?.count || 0} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Wallet className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalOutstanding || 0)}
            </div>
          </CardContent>
        </Card>
        {Object.entries(stats?.byType || {}).slice(0, 2).map(([type, amount]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{type}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(amount as number)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No purchases found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-mono font-medium">{purchase.purchase_number}</TableCell>
                    <TableCell>{format(new Date(purchase.purchase_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{purchase.vendor?.name || "-"}</TableCell>
                    <TableCell>{getTypeBadge(purchase.purchase_type)}</TableCell>
                    <TableCell className="font-mono text-sm">{purchase.invoice_number || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(purchase.grand_total)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${purchase.balance_due > 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(purchase.balance_due)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(purchase.status)}>
                        {purchase.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {purchase.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmPurchase.mutate(purchase.id)}
                          disabled={confirmPurchase.isPending}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Confirm
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
