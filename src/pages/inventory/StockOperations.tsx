import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, History, Package } from "lucide-react";
import { useProducts, useStockMovements, useCreateStockMovement, useUpdateProduct } from "@/hooks/useProducts";
import { useBranch } from "@/contexts/BranchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/formatters";
import type { StockMovementType, ProductStatus } from "@/types/inventory";

const MOVEMENT_TYPES: { value: StockMovementType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "purchase", label: "Stock Receipt", icon: <ArrowDownToLine className="h-5 w-5" />, description: "Add new stock from purchase" },
  { value: "adjustment", label: "Stock Adjustment", icon: <Package className="h-5 w-5" />, description: "Adjust stock for corrections" },
  { value: "transfer_out", label: "Stock Transfer", icon: <ArrowLeftRight className="h-5 w-5" />, description: "Transfer to another branch" },
  { value: "karigar_issue", label: "Issue to Karigar", icon: <ArrowUpFromLine className="h-5 w-5" />, description: "Send for repair/modification" },
  { value: "karigar_receipt", label: "Receive from Karigar", icon: <ArrowDownToLine className="h-5 w-5" />, description: "Receive back from karigar" },
];

const MOVEMENT_COLORS: Record<StockMovementType, string> = {
  purchase: "bg-success text-success-foreground",
  sale: "bg-primary text-primary-foreground",
  transfer_in: "bg-info text-info-foreground",
  transfer_out: "bg-warning text-warning-foreground",
  adjustment: "bg-muted text-muted-foreground",
  karigar_issue: "bg-orange-500 text-white",
  karigar_receipt: "bg-teal-500 text-white",
  return: "bg-destructive text-destructive-foreground",
};

export default function StockOperations() {
  const { currentBranch } = useBranch();
  const { data: products } = useProducts({ status: "in_stock" });
  const { data: movements } = useStockMovements();
  const createMovement = useCreateStockMovement();
  const updateProduct = useUpdateProduct();

  const [showDialog, setShowDialog] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<StockMovementType | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");

  const handleOpenOperation = (type: StockMovementType) => {
    setSelectedOperation(type);
    setSelectedProductId("");
    setNotes("");
    setLocation("");
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!selectedProductId || !selectedOperation) return;

    // Create movement record
    await createMovement.mutateAsync({
      product_id: selectedProductId,
      movement_type: selectedOperation,
      quantity: 1,
      notes,
      to_location: location || undefined,
    });

    // Update product status based on movement type
    let newStatus: ProductStatus | undefined;
    if (selectedOperation === "karigar_issue") {
      newStatus = "with_karigar";
    } else if (selectedOperation === "karigar_receipt") {
      newStatus = "in_stock";
    } else if (selectedOperation === "transfer_out") {
      newStatus = "sold"; // Temporary - actual transfer would create new product at destination
    }

    if (newStatus) {
      await updateProduct.mutateAsync({
        id: selectedProductId,
        status: newStatus,
        location: location || undefined,
      });
    }

    setShowDialog(false);
  };

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Stock Operations</h1>
        <p className="text-muted-foreground">
          Manage stock movements for {currentBranch?.name}
        </p>
      </div>

      <Tabs defaultValue="operations">
        <TabsList>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="history">Movement History</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6 mt-6">
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOVEMENT_TYPES.map((type) => (
              <Card
                key={type.value}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleOpenOperation(type.value)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {type.icon}
                    </div>
                    {type.label}
                  </CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Movements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements?.slice(0, 10).map((movement) => {
                    const product = products?.find(p => p.id === movement.product_id);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>{formatDate(movement.created_at)}</TableCell>
                        <TableCell>
                          <Badge className={MOVEMENT_COLORS[movement.movement_type]}>
                            {movement.movement_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product?.name || movement.product_id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {movement.notes || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!movements || movements.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No stock movements recorded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements?.map((movement) => {
                    const product = products?.find(p => p.id === movement.product_id);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>{formatDate(movement.created_at)}</TableCell>
                        <TableCell>
                          <Badge className={MOVEMENT_COLORS[movement.movement_type]}>
                            {movement.movement_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{product?.name || movement.product_id.slice(0, 8)}</TableCell>
                        <TableCell>{movement.reference_number || "-"}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {movement.notes || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Operation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {MOVEMENT_TYPES.find(t => t.value === selectedOperation)?.label}
            </DialogTitle>
            <DialogDescription>
              {MOVEMENT_TYPES.find(t => t.value === selectedOperation)?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Product *</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.item_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Item:</strong> {selectedProduct.name}</p>
                <p><strong>Code:</strong> {selectedProduct.item_code}</p>
                <p><strong>Weight:</strong> {selectedProduct.net_weight}g {selectedProduct.purity}</p>
                <p><strong>Current Location:</strong> {selectedProduct.location || "Not specified"}</p>
              </div>
            )}

            {(selectedOperation === "transfer_out" || selectedOperation === "adjustment") && (
              <div className="space-y-2">
                <Label>New Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter new location"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedProductId || createMovement.isPending}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
