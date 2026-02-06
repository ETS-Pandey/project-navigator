import { useState } from "react";
import { Plus, TestTube, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRefiningRecords, useCreateRefiningRecord, useMeltingBatches } from "@/hooks/useMelting";

export default function RefiningPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: records = [], isLoading } = useRefiningRecords();
  const { data: batches = [] } = useMeltingBatches();
  const createRecord = useCreateRefiningRecord();

  const [form, setForm] = useState({
    melting_batch_id: "",
    metal_type: "gold",
    sample_weight: 0,
    tested_purity: "",
    pure_metal_content: 0,
    testing_method: "",
    tested_by: "",
    lab_name: "",
    lab_certificate: "",
    notes: "",
  });

  const filteredRecords = records.filter((r) =>
    !search || r.record_number.toLowerCase().includes(search.toLowerCase()) ||
    r.tested_by?.toLowerCase().includes(search.toLowerCase()) ||
    r.lab_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.tested_purity || form.sample_weight <= 0) return;
    await createRecord.mutateAsync(form as any);
    setDialogOpen(false);
    setForm({ melting_batch_id: "", metal_type: "gold", sample_weight: 0, tested_purity: "", pure_metal_content: 0, testing_method: "", tested_by: "", lab_name: "", lab_certificate: "", notes: "" });
  };

  const testingMethods = [
    { value: "fire_assay", label: "Fire Assay" },
    { value: "xrf", label: "XRF Analysis" },
    { value: "touchstone", label: "Touchstone" },
    { value: "acid_test", label: "Acid Test" },
    { value: "spectrometry", label: "Spectrometry" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refining Records</h1>
          <p className="text-muted-foreground">Purity testing and assay records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Test</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Record Purity Test</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Linked Melting Batch (optional)</Label>
                <Select value={form.melting_batch_id} onValueChange={(v) => setForm({ ...form, melting_batch_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.batch_number} ({b.metal_type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Metal Type</Label>
                  <Select value={form.metal_type} onValueChange={(v) => setForm({ ...form, metal_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Testing Method</Label>
                  <Select value={form.testing_method} onValueChange={(v) => setForm({ ...form, testing_method: v })}>
                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      {testingMethods.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Sample Weight (g)</Label>
                  <Input type="number" step="0.001" value={form.sample_weight || ""} onChange={(e) => setForm({ ...form, sample_weight: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="grid gap-2">
                  <Label>Tested Purity</Label>
                  <Input value={form.tested_purity} onChange={(e) => setForm({ ...form, tested_purity: e.target.value })} placeholder="e.g. 99.5%" />
                </div>
                <div className="grid gap-2">
                  <Label>Pure Metal (g)</Label>
                  <Input type="number" step="0.001" value={form.pure_metal_content || ""} onChange={(e) => setForm({ ...form, pure_metal_content: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tested By</Label>
                  <Input value={form.tested_by} onChange={(e) => setForm({ ...form, tested_by: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Lab Name</Label>
                  <Input value={form.lab_name} onChange={(e) => setForm({ ...form, lab_name: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Lab Certificate No.</Label>
                <Input value={form.lab_certificate} onChange={(e) => setForm({ ...form, lab_certificate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createRecord.isPending}>
                {createRecord.isPending ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{records.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Tested Weight</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{records.reduce((s, r) => s + r.sample_weight, 0).toFixed(3)}g</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Pure Metal</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{records.reduce((s, r) => s + (r.pure_metal_content || 0), 0).toFixed(3)}g</div></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Record No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Metal</TableHead>
              <TableHead>Sample Wt.</TableHead>
              <TableHead>Purity</TableHead>
              <TableHead>Pure Metal</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Tested By</TableHead>
              <TableHead>Lab</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-sm">{record.record_number}</TableCell>
                  <TableCell>{new Date(record.test_date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{record.metal_type}</TableCell>
                  <TableCell>{record.sample_weight.toFixed(3)}g</TableCell>
                  <TableCell className="font-semibold">{record.tested_purity}</TableCell>
                  <TableCell>{record.pure_metal_content?.toFixed(3) || '-'}g</TableCell>
                  <TableCell className="capitalize">{record.testing_method?.replace('_', ' ') || '-'}</TableCell>
                  <TableCell>{record.tested_by || '-'}</TableCell>
                  <TableCell>{record.lab_name || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
