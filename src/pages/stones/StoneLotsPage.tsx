import { useState } from "react";
import { Plus, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStoneTypes, useStoneLots, useCreateStoneLot } from "@/hooks/useStones";
import { formatCurrency } from "@/lib/formatters";

export default function StoneLotsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: stoneTypes = [] } = useStoneTypes();
  const { data: lots = [], isLoading } = useStoneLots();
  const createLot = useCreateStoneLot();

  const [form, setForm] = useState({
    stone_type_id: "",
    supplier_name: "",
    total_pieces: 0,
    total_carat_weight: 0,
    total_cost: 0,
    shape: "",
    color_grade: "",
    clarity_grade: "",
    cut_grade: "",
    certification: "",
    certificate_number: "",
    notes: "",
  });

  const filteredLots = lots.filter((l) =>
    !search || l.lot_number.toLowerCase().includes(search.toLowerCase()) ||
    l.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.stone_type?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.stone_type_id) return;
    await createLot.mutateAsync(form as any);
    setDialogOpen(false);
    setForm({ stone_type_id: "", supplier_name: "", total_pieces: 0, total_carat_weight: 0, total_cost: 0, shape: "", color_grade: "", clarity_grade: "", cut_grade: "", certification: "", certificate_number: "", notes: "" });
  };

  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-800",
    partially_used: "bg-yellow-100 text-yellow-800",
    depleted: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stone Lots</h1>
          <p className="text-muted-foreground">Manage stone parcels and lots</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Lot</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Stone Lot</DialogTitle></DialogHeader>
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
              <div className="grid gap-2">
                <Label>Supplier Name</Label>
                <Input value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Total Pieces</Label>
                  <Input type="number" value={form.total_pieces || ""} onChange={(e) => setForm({ ...form, total_pieces: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="grid gap-2">
                  <Label>Total Carat</Label>
                  <Input type="number" step="0.001" value={form.total_carat_weight || ""} onChange={(e) => setForm({ ...form, total_carat_weight: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="grid gap-2">
                  <Label>Total Cost (₹)</Label>
                  <Input type="number" value={form.total_cost || ""} onChange={(e) => setForm({ ...form, total_cost: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Shape</Label>
                  <Input value={form.shape} onChange={(e) => setForm({ ...form, shape: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Certification</Label>
                  <Input value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} placeholder="e.g. GIA" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <Input value={form.color_grade} onChange={(e) => setForm({ ...form, color_grade: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Clarity</Label>
                  <Input value={form.clarity_grade} onChange={(e) => setForm({ ...form, clarity_grade: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Cut</Label>
                  <Input value={form.cut_grade} onChange={(e) => setForm({ ...form, cut_grade: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createLot.isPending || !form.stone_type_id}>
                {createLot.isPending ? "Saving..." : "Create Lot"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lots</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{lots.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carats</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{lots.reduce((s, l) => s + l.total_carat_weight, 0).toFixed(3)} ct</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(lots.reduce((s, l) => s + l.total_cost, 0))}</div></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search lots..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lot No.</TableHead>
              <TableHead>Stone Type</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Pieces</TableHead>
              <TableHead>Total Carat</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Per Carat</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filteredLots.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No lots found</TableCell></TableRow>
            ) : (
              filteredLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-mono text-sm">{lot.lot_number}</TableCell>
                  <TableCell>{lot.stone_type?.name || '-'}</TableCell>
                  <TableCell>{lot.supplier_name || '-'}</TableCell>
                  <TableCell>{lot.total_pieces}</TableCell>
                  <TableCell>{lot.total_carat_weight} ct</TableCell>
                  <TableCell>{lot.available_pieces} pcs / {lot.available_carat_weight} ct</TableCell>
                  <TableCell>{formatCurrency(lot.total_cost)}</TableCell>
                  <TableCell>{formatCurrency(lot.cost_per_carat)}/ct</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[lot.status] || ""}>
                      {lot.status.replace('_', ' ')}
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
