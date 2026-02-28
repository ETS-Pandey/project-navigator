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
    return <Badge variant="outline" className="capitalize text-[10px] sm:text-xs">{label}</Badge>;
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-3xl">Purchases</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Manage purchase entries and vendor invoices</p>
        </div>
        <Link to="/purchase/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Purchase
          </Button>
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Total</CardTitle>
            <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold sm:text-2xl">{formatCurrency(stats?.totalPurchases || 0)}</div>
            <p className="text-[10px] text-muted-foreground sm:text-xs">{stats?.count || 0} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Outstanding</CardTitle>
            <Wallet className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold text-red-600 sm:text-2xl">
              {formatCurrency(stats?.totalOutstanding || 0)}
            </div>
          </CardContent>
        </Card>
        {Object.entries(stats?.byType || {}).slice(0, 2).map(([type, amount]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
              <CardTitle className="text-xs font-medium capitalize sm:text-sm">{type}</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="text-lg font-bold sm:text-2xl">{formatCurrency(amount as number)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
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
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter status" />
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Purchase #</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs">Vendor</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-right text-xs">Amount</TableHead>
                  <TableHead className="text-right text-xs hidden sm:table-cell">Balance</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-sm">Loading...</TableCell>
                  </TableRow>
                ) : filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                      No purchases found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-mono font-medium text-xs">{purchase.purchase_number}</TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">{format(new Date(purchase.purchase_date), "dd MMM yy")}</TableCell>
                      <TableCell className="text-xs">{purchase.vendor?.name || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{getTypeBadge(purchase.purchase_type)}</TableCell>
                      <TableCell className="text-right text-xs font-medium">
                        {formatCurrency(purchase.grand_total)}
                      </TableCell>
                      <TableCell className={`text-right text-xs font-medium hidden sm:table-cell ${purchase.balance_due > 0 ? "text-red-600" : "text-green-600"}`}>
                        {formatCurrency(purchase.balance_due)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadge(purchase.status)} text-[10px]`}>
                          {purchase.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {purchase.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
