import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Printer,
  Package,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Scale,
  Gem,
  Tag,
  BadgeCheck,
  Plus,
  ArrowRightLeft,
  Minus,
} from "lucide-react";
import { useProduct, useStockMovements, useCreateStockMovement } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductLabel } from "@/components/inventory/ProductLabel";
import { formatCurrency, formatWeight } from "@/lib/formatters";
import { format } from "date-fns";
import type { StockMovementType } from "@/types/inventory";

const STATUS_COLORS: Record<string, string> = {
  in_stock: "bg-green-500/10 text-green-600 border-green-500/20",
  sold: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  on_approval: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  with_karigar: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_repair: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  melted: "bg-red-500/10 text-red-600 border-red-500/20",
};

const MOVEMENT_ICONS: Record<string, typeof Plus> = {
  purchase: Plus,
  sale: Minus,
  transfer_in: ArrowRightLeft,
  transfer_out: ArrowRightLeft,
  adjustment: Scale,
  karigar_issue: ArrowRightLeft,
  karigar_receipt: ArrowRightLeft,
  return: ArrowRightLeft,
};

const MOVEMENT_COLORS: Record<string, string> = {
  purchase: "text-green-600 bg-green-50",
  sale: "text-red-600 bg-red-50",
  transfer_in: "text-blue-600 bg-blue-50",
  transfer_out: "text-orange-600 bg-orange-50",
  adjustment: "text-purple-600 bg-purple-50",
  karigar_issue: "text-yellow-600 bg-yellow-50",
  karigar_receipt: "text-teal-600 bg-teal-50",
  return: "text-gray-600 bg-gray-50",
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [movementType, setMovementType] = useState<StockMovementType>("adjustment");
  const [movementNotes, setMovementNotes] = useState("");
  const [toLocation, setToLocation] = useState("");

  const { data: product, isLoading } = useProduct(id || "");
  const { data: stockMovements, isLoading: movementsLoading } = useStockMovements(id);
  const createMovement = useCreateStockMovement();

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !product) return;

    const labelHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Product Label - ${product.item_code}</title>
          <style>
            body { margin: 0; padding: 20mm; font-family: Arial, sans-serif; }
            @media print { @page { size: auto; margin: 10mm; } }
          </style>
        </head>
        <body>
          <div id="label"></div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(labelHtml);
    printWindow.document.close();
    setShowPrintDialog(false);
  };

  const handleRecordMovement = async () => {
    if (!id) return;
    await createMovement.mutateAsync({
      product_id: id,
      movement_type: movementType,
      notes: movementNotes,
      to_location: toLocation || undefined,
    });
    setShowMovementDialog(false);
    setMovementNotes("");
    setToLocation("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate("/inventory/products")}>Back to Products</Button>
      </div>
    );
  }

  const images = product.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <Badge className={STATUS_COLORS[product.status] || ""} variant="outline">
                {product.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono">{product.item_code}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Record Movement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Stock Movement</DialogTitle>
                <DialogDescription>
                  Record a stock movement for {product.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Movement Type</Label>
                  <Select value={movementType} onValueChange={(v) => setMovementType(v as StockMovementType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer_out">Transfer Out</SelectItem>
                      <SelectItem value="transfer_in">Transfer In</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="karigar_issue">Issue to Karigar</SelectItem>
                      <SelectItem value="karigar_receipt">Receive from Karigar</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(movementType === "transfer_out" || movementType === "karigar_issue") && (
                  <div className="space-y-2">
                    <Label>To Location / Karigar</Label>
                    <Input
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      placeholder="Enter destination"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={movementNotes}
                    onChange={(e) => setMovementNotes(e.target.value)}
                    placeholder="Add notes about this movement..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMovementDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRecordMovement} disabled={createMovement.isPending}>
                  Record Movement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Label
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Print Product Label</DialogTitle>
                <DialogDescription>
                  Preview and print the label for this product
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 flex justify-center">
                <ProductLabel
                  product={{
                    id: product.id,
                    item_code: product.item_code,
                    barcode: product.barcode || undefined,
                    name: product.name,
                    metal_type: product.metal_type,
                    purity: product.purity,
                    net_weight: product.net_weight,
                    total_cost: product.total_cost || undefined,
                    huid: product.huid || undefined,
                  }}
                  size="large"
                  type="barcode"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
                  Cancel
                </Button>
                <Link to="/inventory/barcodes">
                  <Button>
                    <Printer className="mr-2 h-4 w-4" />
                    Go to Print Page
                  </Button>
                </Link>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button asChild>
            <Link to={`/inventory/products/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              {hasImages ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={images[currentImageIndex]?.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2"
                          onClick={() => setCurrentImageIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setCurrentImageIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 justify-center">
                      {images.map((img: any, index: number) => (
                        <button
                          key={img.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex
                              ? "border-primary"
                              : "border-transparent hover:border-muted-foreground"
                          }`}
                        >
                          <img
                            src={img.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                  <Package className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">Basic Information</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{product.category?.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sub-category</p>
                      <p className="font-medium">{product.sub_category?.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{product.location || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Added</p>
                      <p className="font-medium">{format(new Date(product.created_at), "dd MMM yyyy")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metal Details */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">Metal Details</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">Metal Type</p>
                    <p className="text-lg font-semibold capitalize">{product.metal_type}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">Purity</p>
                    <p className="text-lg font-semibold">{product.purity}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="text-lg font-semibold capitalize">{product.metal_color?.replace("_", " ") || "—"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Weight Details */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">Weight Details</h4>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Wt.</p>
                      <p className="font-medium">{formatWeight(product.gross_weight)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Gem className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stone Wt.</p>
                      <p className="font-medium">{formatWeight(product.stone_weight || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Wt.</p>
                      <p className="font-medium">{formatWeight(product.net_weight)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wastage</p>
                      <p className="font-medium">{product.wastage_percent}% ({formatWeight(product.wastage_weight || 0)})</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hallmark Details */}
              {product.is_hallmarked && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Hallmark Details</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <BadgeCheck className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">HUID</p>
                          <p className="font-medium font-mono">{product.huid || "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Hallmark Center</p>
                          <p className="font-medium">{product.hallmark_center || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              {product.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                    <p className="text-sm">{product.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing & History */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metal Value</span>
                <span>{formatCurrency(product.metal_value || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Making Charges</span>
                <span>{formatCurrency(product.making_charge_amount || 0)}</span>
              </div>
              {product.stone_value && product.stone_value > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stone Value</span>
                  <span>{formatCurrency(product.stone_value)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Cost</span>
                <span className="text-primary">{formatCurrency(product.total_cost || 0)}</span>
              </div>
              {product.mrp && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MRP</span>
                  <span className="font-medium">{formatCurrency(product.mrp)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock History */}
          <Card>
            <CardHeader>
              <CardTitle>Stock History</CardTitle>
              <CardDescription>Movement timeline for this product</CardDescription>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stockMovements?.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No movement history</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {stockMovements?.slice(0, 10).map((movement) => {
                      const Icon = MOVEMENT_ICONS[movement.movement_type] || ArrowRightLeft;
                      const colorClass = MOVEMENT_COLORS[movement.movement_type] || "text-gray-600 bg-gray-50";
                      return (
                        <div key={movement.id} className="relative flex gap-3 pl-1">
                          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm capitalize">
                              {movement.movement_type.replace("_", " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(movement.created_at), "dd MMM yyyy, HH:mm")}
                            </p>
                            {movement.notes && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {movement.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
