import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings, Users, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSchemes, useSchemeStatistics, useCreateScheme } from "@/hooks/useSchemes";
import { formatCurrency } from "@/lib/formatters";
import { SchemeForm } from "@/components/schemes/SchemeForm";
import type { SchemeFormData } from "@/types/schemes";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  discontinued: "bg-red-100 text-red-800",
};

export default function SchemesList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'discontinued'>('active');

  const { data: schemes = [], isLoading } = useSchemes(activeTab);
  const { data: stats } = useSchemeStatistics();
  const createScheme = useCreateScheme();

  const filteredSchemes = schemes.filter(
    (s) =>
      s.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.scheme_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateScheme = async (data: SchemeFormData) => {
    await createScheme.mutateAsync(data);
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Savings Schemes</h1>
          <p className="text-muted-foreground">Manage savings schemes and enrollments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/schemes/enrollments")}>
            <Users className="mr-2 h-4 w-4" />
            Enrollments
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Scheme
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Enrollments</p>
            <p className="text-2xl font-bold">{stats?.totalActiveEnrollments || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalCollected || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Dues</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.pendingDues || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Maturing This Month</p>
            <p className="text-2xl font-bold">{stats?.maturing_this_month || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue Payments</p>
            <p className="text-2xl font-bold text-red-600">{stats?.overdue_payments || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Schemes List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Scheme Configurations</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search schemes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="discontinued">Discontinued</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredSchemes.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No schemes found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scheme</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchemes.map((scheme) => (
                      <TableRow
                        key={scheme.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/schemes/${scheme.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{scheme.scheme_name}</p>
                            <p className="text-xs text-muted-foreground">{scheme.scheme_code}</p>
                          </div>
                        </TableCell>
                        <TableCell>{scheme.duration_months} months</TableCell>
                        <TableCell className="text-right">{formatCurrency(scheme.monthly_amount)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(scheme.total_amount)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {scheme.bonus_type === 'fixed' && formatCurrency(scheme.bonus_value)}
                            {scheme.bonus_type === 'percentage' && `${scheme.bonus_value}%`}
                            {scheme.bonus_type === 'gold_bonus' && `${scheme.bonus_value}g gold`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[scheme.status]}>{scheme.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/schemes/${scheme.id}`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Scheme
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Scheme Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Scheme</DialogTitle>
          </DialogHeader>
          <SchemeForm onSubmit={handleCreateScheme} isLoading={createScheme.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
