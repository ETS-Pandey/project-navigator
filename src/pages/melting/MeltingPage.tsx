import { useState } from "react";
import { Plus, Flame, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMeltingBatches, useCreateMeltingBatch, useUpdateMeltingBatch } from "@/hooks/useMelting";
import { formatCurrency } from "@/lib/formatters";
import type { MeltingInputItem } from "@/types/melting";

export default function MeltingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  const { data: batches = [], isLoading } = useMeltingBatches(statusFilter || undefined);
  const createBatch = useCreateMeltingBatch();
  const updateBatch = useUpdateMeltingBatch();

  const [form, setForm] = useState({
    metal_type: "gold",
    refiner_name: "",
    refining_charges: 0,
    expected_pure_weight: 0,
    notes: "",
  });

  const [inputItems, setInputItems] = useState<MeltingInputItem[]>([
    { description: "", weight: 0, purity: "", source: "" },
  ]);

  const [completeForm, setCompleteForm] = useState({
    actual_output_weight: 0,
    output_purity: "",
    actual_pure_weight: 0,
  });

  const filteredBatches = batches.filter((b) =>
    !search || b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
    b.refiner_name?.toLowerCase().includes(search.toLowerCase())
  );

  const addInputItem = () => {
    setInputItems([...inputItems, { description: "", weight: 0, purity: "", source: "" }]);
  };

  const updateInputItem = (index: number, field: keyof MeltingInputItem, value: any) => {
    const updated = [...inputItems];
    (updated[index] as any)[field] = value;
    setInputItems(updated);
  };

  const removeInputItem = (index: number) => {
    setInputItems(inputItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const validItems = inputItems.filter(i => i.description && i.weight > 0);
    if (validItems.length === 0) return;
    await createBatch.mutateAsync({
      ...form,
      input_items: validItems,
    } as any);
    setDialogOpen(false);
    setForm({ metal_type: "gold", refiner_name: "", refining_charges: 0, expected_pure_weight: 0, notes: "" });
    setInputItems([{ description: "", weight: 0, purity: "", source: "" }]);
  };

  const handleComplete = async () => {
    if (!selectedBatchId) return;
    const weightLoss = completeForm.actual_output_weight > 0
      ? batches.find(b => b.id === selectedBatchId)?.input_total_weight! - completeForm.actual_output_weight
      : 0;
    const lossPercent = batches.find(b => b.id === selectedBatchId)?.input_total_weight
      ? (weightLoss / batches.find(b => b.id === selectedBatchId)?.input_total_weight!) * 100
      : 0;

    await updateBatch.mutateAsync({
      id: selectedBatchId,
      actual_output_weight: completeForm.actual_output_weight,
      output_purity: completeForm.output_purity,
      actual_pure_weight: completeForm.actual_pure_weight,
      weight_loss: weightLoss,
      loss_percentage: parseFloat(lossPercent.toFixed(2)),
      status: 'completed' as const,
      completed_at: new Date().toISOString(),
    });
    setCompleteDialogOpen(false);
    setCompleteForm({ actual_output_weight: 0, output_purity: "", actual_pure_weight: 0 });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    in_process: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const summaryStats = {
    total: batches.length,
    pending: batches.filter(b => b.status === 'pending').length,
    completed: batches.filter(b => b.status === 'completed').length,
    totalWeight: batches.reduce((s, b) => s + b.input_total_weight, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Melting & Refining</h1>
          <p className="text-muted-foreground">Track melting batches and refining output</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Batch</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create Melting Batch</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
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
                  <Label>Refiner Name</Label>
                  <Input value={form.refiner_name} onChange={(e) => setForm({ ...form, refiner_name: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Refining Charges (₹)</Label>
                  <Input type="number" value={form.refining_charges || ""} onChange={(e) => setForm({ ...form, refining_charges: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="grid gap-2">
                  <Label>Expected Pure Weight (g)</Label>
                  <Input type="number" step="0.001" value={form.expected_pure_weight || ""} onChange={(e) => setForm({ ...form, expected_pure_weight: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Input Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addInputItem}>
                    <Plus className="h-3 w-3 mr-1" />Add Item
                  </Button>
                </div>
                {inputItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input value={item.description} onChange={(e) => updateInputItem(idx, 'description', e.target.value)} placeholder="Old gold ring" />
                    </div>
                    <div>
                      <Label className="text-xs">Weight (g)</Label>
                      <Input type="number" step="0.001" value={item.weight || ""} onChange={(e) => updateInputItem(idx, 'weight', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <Label className="text-xs">Purity</Label>
                      <Input value={item.purity} onChange={(e) => updateInputItem(idx, 'purity', e.target.value)} placeholder="22K" />
                    </div>
                    <div>
                      <Label className="text-xs">Source</Label>
                      <Input value={item.source} onChange={(e) => updateInputItem(idx, 'source', e.target.value)} placeholder="Old gold" />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeInputItem(idx)} className="text-destructive" disabled={inputItems.length <= 1}>
                      ✕
                    </Button>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  Total Input: {inputItems.reduce((s, i) => s + (i.weight || 0), 0).toFixed(3)}g
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createBatch.isPending}>
                {createBatch.isPending ? "Creating..." : "Create Batch"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{summaryStats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{summaryStats.pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{summaryStats.completed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Input Weight</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summaryStats.totalWeight.toFixed(3)}g</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search batches..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_process">In Process</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Metal</TableHead>
              <TableHead>Input Weight</TableHead>
              <TableHead>Output Weight</TableHead>
              <TableHead>Loss</TableHead>
              <TableHead>Refiner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filteredBatches.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No batches found</TableCell></TableRow>
            ) : (
              filteredBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-mono text-sm">{batch.batch_number}</TableCell>
                  <TableCell>{new Date(batch.batch_date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{batch.metal_type}</TableCell>
                  <TableCell>{batch.input_total_weight.toFixed(3)}g</TableCell>
                  <TableCell>{batch.actual_output_weight ? `${batch.actual_output_weight.toFixed(3)}g` : '-'}</TableCell>
                  <TableCell>{batch.loss_percentage != null ? `${batch.loss_percentage}%` : '-'}</TableCell>
                  <TableCell>{batch.refiner_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[batch.status] || ""}>
                      {batch.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {batch.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => updateBatch.mutateAsync({ id: batch.id, status: 'in_process' as const, started_at: new Date().toISOString() })}>
                          Start
                        </Button>
                      </div>
                    )}
                    {batch.status === 'in_process' && (
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedBatchId(batch.id);
                        setCompleteDialogOpen(true);
                      }}>
                        Complete <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Complete Melting Batch</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Actual Output Weight (g)</Label>
              <Input type="number" step="0.001" value={completeForm.actual_output_weight || ""} onChange={(e) => setCompleteForm({ ...completeForm, actual_output_weight: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="grid gap-2">
              <Label>Output Purity</Label>
              <Input value={completeForm.output_purity} onChange={(e) => setCompleteForm({ ...completeForm, output_purity: e.target.value })} placeholder="e.g. 99.5%" />
            </div>
            <div className="grid gap-2">
              <Label>Actual Pure Metal Weight (g)</Label>
              <Input type="number" step="0.001" value={completeForm.actual_pure_weight || ""} onChange={(e) => setCompleteForm({ ...completeForm, actual_pure_weight: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleComplete} disabled={updateBatch.isPending}>
              {updateBatch.isPending ? "Saving..." : "Complete Batch"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
