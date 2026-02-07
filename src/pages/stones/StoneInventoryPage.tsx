import { useState } from "react";
import { Plus, Gem, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStoneTypes, useStoneInventory, useCreateStoneItem } from "@/hooks/useStones";
import { formatCurrency } from "@/lib/formatters";

export default function StoneInventoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: stoneTypes = [] } = useStoneTypes();
  const { data: stones = [], isLoading } = useStoneInventory({
    stoneTypeId: typeFilter || undefined,
    status: statusFilter || undefined,
  });
  const createStone = useCreateStoneItem();

  const [form, setForm] = useState({
    stone_type_id: "",
    carat_weight: 0,
    shape: "",
    color_grade: "",
    clarity_grade: "",
    cut_grade: "",
    dimensions: "",
    certification: "",
    certificate_number: "",
    cost_price: 0,
    market_value: 0,
    location: "",
    notes: "",
  });

  const filteredStones = stones.filter((s) =>
    !search || s.stone_code.toLowerCase().includes(search.toLowerCase()) ||
    s.stone_type?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.stone_type_id) return;
    await createStone.mutateAsync(form as any);
    setDialogOpen(false);
    setForm({ stone_type_id: "", carat_weight: 0, shape: "", color_grade: "", clarity_grade: "", cut_grade: "", dimensions: "", certification: "", certificate_number: "", cost_price: 0, market_value: 0, location: "", notes: "" });
  };

  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    issued: "bg-yellow-100 text-yellow-800",
    set: "bg-blue-100 text-blue-800",
    sold: "bg-gray-100 text-gray-800",
    returned: "bg-orange-100 text-orange-800",
    lost: "bg-red-100 text-red-800",
  };

  const summaryStats = {
    total: stones.length,
    available: stones.filter(s => s.status === 'available').length,
    issued: stones.filter(s => s.status === 'issued').length,
    totalValue: stones.reduce((s, st) => s + (st.cost_price || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stone Inventory</h1>
          <p className="text-muted-foreground">Track individual stones with certification details</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Stone</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Stone</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Stone Type *</Label>
                <Select value={form.stone_type_id} onValueChange={(v) => setForm({ ...form, stone_type_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stone type" /></SelectTrigger>
                  <SelectContent>
                    {stoneTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Carat Weight</Label>
                  <Input type="number" step="0.001" value={form.carat_weight || ""} onChange={(e) => setForm({ ...form, carat_weight: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="grid gap-2">
                  <Label>Shape</Label>
                  <Select value={form.shape} onValueChange={(v) => setForm({ ...form, shape: v })}>
                    <SelectTrigger><SelectValue placeholder="Select shape" /></SelectTrigger>
                    <SelectContent>
                      {["Round", "Princess", "Oval", "Marquise", "Pear", "Cushion", "Emerald", "Heart", "Radiant", "Cabochon"].map(s => (
                        <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Color Grade</Label>
                  <Input value={form.color_grade} onChange={(e) => setForm({ ...form, color_grade: e.target.value })} placeholder="e.g. D, E, F" />
                </div>
                <div className="grid gap-2">
                  <Label>Clarity</Label>
                  <Input value={form.clarity_grade} onChange={(e) => setForm({ ...form, clarity_grade: e.target.value })} placeholder="e.g. VVS1" />
                </div>
                <div className="grid gap-2">
                  <Label>Cut</Label>
                  <Input value={form.cut_grade} onChange={(e) => setForm({ ...form, cut_grade: e.target.value })} placeholder="e.g. Excellent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Cost Price (₹)</Label>
                  <Input type="number" value={form.cost_price || ""} onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="grid gap-2">
                  <Label>Market Value (₹)</Label>
                  <Input type="number" value={form.market_value || ""} onChange={(e) => setForm({ ...form, market_value: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Certification</Label>
                  <Input value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} placeholder="e.g. GIA, IGI" />
                </div>
                <div className="grid gap-2">
                  <Label>Certificate No.</Label>
                  <Input value={form.certificate_number} onChange={(e) => setForm({ ...form, certificate_number: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Dimensions</Label>
                <Input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. 6.5 x 6.5 x 4.0 mm" />
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Storage location" />
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createStone.isPending || !form.stone_type_id}>
                {createStone.isPending ? "Saving..." : "Add Stone"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stones</CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{summaryStats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{summaryStats.available}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issued</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{summaryStats.issued}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(summaryStats.totalValue)}</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by code or type..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {stoneTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="set">Set in Product</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Carat</TableHead>
              <TableHead>Shape</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Clarity</TableHead>
              <TableHead>Certification</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Loading stones...</TableCell></TableRow>
            ) : filteredStones.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No stones found</TableCell></TableRow>
            ) : (
              filteredStones.map((stone) => (
                <TableRow key={stone.id}>
                  <TableCell className="font-mono text-sm">{stone.stone_code}</TableCell>
                  <TableCell>{stone.stone_type?.name || '-'}</TableCell>
                  <TableCell>{stone.carat_weight} ct</TableCell>
                  <TableCell className="capitalize">{stone.shape || '-'}</TableCell>
                  <TableCell>{stone.color_grade || '-'}</TableCell>
                  <TableCell>{stone.clarity_grade || '-'}</TableCell>
                  <TableCell>{stone.certification ? `${stone.certification} ${stone.certificate_number || ''}` : '-'}</TableCell>
                  <TableCell>{formatCurrency(stone.cost_price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[stone.status] || ""}>
                      {stone.status}
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
