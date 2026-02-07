import { useState } from "react";
import { Plus, FileCheck, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppraisals } from "@/hooks/useAppraisals";
import { formatCurrency } from "@/lib/formatters";

export default function AppraisalListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data: appraisals = [], isLoading } = useAppraisals(statusFilter || undefined);

  const filteredAppraisals = appraisals.filter((a) =>
    !search || a.appraisal_number.toLowerCase().includes(search.toLowerCase()) ||
    a.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.customer_phone?.includes(search)
  );

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    certificate_issued: "bg-purple-100 text-purple-800",
    expired: "bg-red-100 text-red-800",
  };

  const purposeLabels: Record<string, string> = {
    valuation: "Valuation",
    insurance: "Insurance",
    loan: "Loan",
    sale: "Sale",
    purchase: "Purchase",
  };

  const summaryStats = {
    total: appraisals.length,
    completed: appraisals.filter(a => a.status === 'completed' || a.status === 'certificate_issued').length,
    totalValue: appraisals.reduce((s, a) => s + a.grand_total, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appraisals</h1>
          <p className="text-muted-foreground">Jewellery valuation and appraisal certificates</p>
        </div>
        <Button onClick={() => navigate("/appraisals/new")}>
          <Plus className="h-4 w-4 mr-2" />New Appraisal
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appraisals</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{summaryStats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{summaryStats.completed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Appraised Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(summaryStats.totalValue)}</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search appraisals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="certificate_issued">Certificate Issued</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appraisal No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Weight</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filteredAppraisals.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No appraisals found</TableCell></TableRow>
            ) : (
              filteredAppraisals.map((appraisal) => (
                <TableRow key={appraisal.id} className="cursor-pointer" onClick={() => navigate(`/appraisals/${appraisal.id}`)}>
                  <TableCell className="font-mono text-sm">{appraisal.appraisal_number}</TableCell>
                  <TableCell>{new Date(appraisal.appraisal_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appraisal.customer_name || 'Walk-in'}</div>
                      {appraisal.customer_phone && <div className="text-xs text-muted-foreground">{appraisal.customer_phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{purposeLabels[appraisal.purpose] || appraisal.purpose}</TableCell>
                  <TableCell>{appraisal.total_items}</TableCell>
                  <TableCell>{appraisal.total_weight.toFixed(3)}g</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(appraisal.grand_total)}</TableCell>
                  <TableCell>{appraisal.valid_until ? new Date(appraisal.valid_until).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[appraisal.status] || ""}>
                      {appraisal.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
