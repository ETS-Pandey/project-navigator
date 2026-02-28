import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, UserCheck, UserX, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/billing/CustomerForm";
import { useCustomers, useCreateCustomer } from "@/hooks/useCustomers";
import { formatCurrency } from "@/lib/formatters";
import type { CustomerFormData } from "@/types/billing";

const typeColors: Record<string, string> = {
  retail: "bg-blue-500",
  wholesale: "bg-purple-500",
  corporate: "bg-orange-500",
};

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const { data: customers = [], isLoading } = useCustomers({
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
  });
  
  const createCustomer = useCreateCustomer();
  
  const handleCreateCustomer = async (data: CustomerFormData) => {
    await createCustomer.mutateAsync(data);
    setShowAddDialog(false);
  };
  
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const totalOutstanding = customers.reduce((sum, c) => sum + Number(c.outstanding_balance || 0), 0);
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-3xl">Customers</h1>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Customer
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Total</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold sm:text-2xl">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Active</CardTitle>
            <UserCheck className="h-3.5 w-3.5 text-green-500 sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold text-green-600 sm:text-2xl">{activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Inactive</CardTitle>
            <UserX className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold text-muted-foreground sm:text-2xl">{totalCustomers - activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 pt-3 sm:px-6 sm:pt-6 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="text-lg font-bold text-destructive sm:text-2xl">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:pt-6 sm:px-6 sm:pb-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Customer List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-right text-xs hidden lg:table-cell">Credit Limit</TableHead>
                  <TableHead className="text-right text-xs">Outstanding</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm">Loading...</TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{customer.name}</div>
                          <div className="text-[10px] text-muted-foreground">{customer.customer_code}</div>
                          {/* Show phone inline on mobile since Contact column is hidden */}
                          <div className="text-[10px] text-muted-foreground sm:hidden">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-0.5">
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={`${typeColors[customer.customer_type]} text-[10px]`}>
                          {customer.customer_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs hidden lg:table-cell">
                        {formatCurrency(customer.credit_limit || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-xs ${Number(customer.outstanding_balance) > 0 ? "text-destructive font-medium" : ""}`}>
                          {formatCurrency(customer.outstanding_balance || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={customer.is_active ? "default" : "secondary"} className="text-[10px]">
                          {customer.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm onSubmit={handleCreateCustomer} isLoading={createCustomer.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
