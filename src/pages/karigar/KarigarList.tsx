import { useState } from "react";
import { Plus, Pencil, Trash2, Search, User, Phone, MapPin } from "lucide-react";
import { useKarigars, useCreateKarigar, useUpdateKarigar, useDeleteKarigar } from "@/hooks/useKarigars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AITextAssist } from "@/components/ai/AITextAssist";
import type { Karigar, KarigarFormData } from "@/types/karigar";

export default function KarigarList() {
  const { data: karigars, isLoading } = useKarigars();
  const createKarigar = useCreateKarigar();
  const updateKarigar = useUpdateKarigar();
  const deleteKarigar = useDeleteKarigar();

  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedKarigar, setSelectedKarigar] = useState<Karigar | null>(null);
  const [formData, setFormData] = useState<KarigarFormData>({
    name: "",
    code: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    aadhar: "",
    pan: "",
    specialization: "",
    commission_rate: 0,
    notes: "",
    is_active: true,
  });

  const filteredKarigars = karigars?.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.code.toLowerCase().includes(search.toLowerCase()) ||
      k.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = (karigar?: Karigar) => {
    if (karigar) {
      setSelectedKarigar(karigar);
      setFormData({
        name: karigar.name,
        code: karigar.code,
        phone: karigar.phone || "",
        email: karigar.email || "",
        address: karigar.address || "",
        city: karigar.city || "",
        state: karigar.state || "",
        pincode: karigar.pincode || "",
        aadhar: karigar.aadhar || "",
        pan: karigar.pan || "",
        specialization: karigar.specialization || "",
        commission_rate: karigar.commission_rate || 0,
        notes: karigar.notes || "",
        is_active: karigar.is_active,
      });
    } else {
      setSelectedKarigar(null);
      setFormData({
        name: "",
        code: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        aadhar: "",
        pan: "",
        specialization: "",
        commission_rate: 0,
        notes: "",
        is_active: true,
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (selectedKarigar) {
      await updateKarigar.mutateAsync({ id: selectedKarigar.id, ...formData });
    } else {
      await createKarigar.mutateAsync(formData);
    }
    setShowDialog(false);
  };

  const handleDelete = async () => {
    if (selectedKarigar) {
      await deleteKarigar.mutateAsync(selectedKarigar.id);
      setShowDeleteDialog(false);
      setSelectedKarigar(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Karigar Management</h1>
          <p className="text-muted-foreground">Manage your artisans and craftsmen</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Karigar
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search karigars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredKarigars?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No karigars found</p>
            <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
              Add your first karigar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredKarigars?.map((karigar) => (
            <Card key={karigar.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{karigar.name}</CardTitle>
                    <CardDescription className="font-mono">{karigar.code}</CardDescription>
                  </div>
                  <Badge variant={karigar.is_active ? "default" : "secondary"}>
                    {karigar.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {karigar.specialization && (
                  <p className="text-sm text-muted-foreground">{karigar.specialization}</p>
                )}
                {karigar.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {karigar.phone}
                  </div>
                )}
                {karigar.city && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {karigar.city}
                  </div>
                )}
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>Gold: {karigar.balance_gold_grams}g</span>
                  <span>•</span>
                  <span>Silver: {karigar.balance_silver_grams}g</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(karigar)}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      setSelectedKarigar(karigar);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedKarigar ? "Edit Karigar" : "Add New Karigar"}</DialogTitle>
            <DialogDescription>
              {selectedKarigar ? "Update karigar details" : "Add a new artisan to your team"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Karigar name"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="KRG001"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Ring making, Chain work"
                />
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Aadhar Number</Label>
                <Input
                  value={formData.aadhar}
                  onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                  placeholder="12 digit Aadhar"
                />
              </div>
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="PAN number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Notes</Label>
                <AITextAssist
                  fieldName="order_notes"
                  context="karigar artisan notes"
                  onSuggestion={(text) => setFormData({ ...formData, notes: text })}
                />
              </div>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.code || createKarigar.isPending || updateKarigar.isPending}
            >
              {selectedKarigar ? "Update" : "Add"} Karigar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Karigar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedKarigar?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
