import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Printer,
  Settings2,
  Search,
  CheckSquare,
  Square,
  QrCode,
  Barcode,
  Package,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useBranch } from "@/contexts/BranchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductLabel, LabelProduct, LabelSize, LabelType } from "@/components/inventory/ProductLabel";
import { LabelPrintSheet } from "@/components/inventory/LabelPrintSheet";
import { formatWeight, formatCurrency } from "@/lib/formatters";

export default function Barcodes() {
  const { currentBranch } = useBranch();
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [labelsPerProduct, setLabelsPerProduct] = useState(1);
  const [labelSize, setLabelSize] = useState<LabelSize>("medium");
  const [labelType, setLabelType] = useState<LabelType>("barcode");
  const [showPrice, setShowPrice] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [showHUID, setShowHUID] = useState(true);
  const [columns, setColumns] = useState(3);

  const printRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    status: "in_stock",
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Product Labels",
  });

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAll = () => {
    if (products) {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const deselectAll = () => {
    setSelectedProducts(new Set());
  };

  const selectedProductsList: LabelProduct[] =
    products?.filter((p) => selectedProducts.has(p.id)).map((p) => ({
      id: p.id,
      item_code: p.item_code,
      barcode: p.barcode || undefined,
      name: p.name,
      metal_type: p.metal_type,
      purity: p.purity,
      net_weight: p.net_weight,
      total_cost: p.total_cost || undefined,
      huid: p.huid || undefined,
    })) || [];

  // Preview product (first selected or first in list)
  const previewProduct: LabelProduct | null =
    selectedProductsList[0] ||
    (products?.[0]
      ? {
          id: products[0].id,
          item_code: products[0].item_code,
          barcode: products[0].barcode || undefined,
          name: products[0].name,
          metal_type: products[0].metal_type,
          purity: products[0].purity,
          net_weight: products[0].net_weight,
          total_cost: products[0].total_cost || undefined,
          huid: products[0].huid || undefined,
        }
      : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Barcodes & Labels</h1>
          <p className="text-muted-foreground">
            Generate and print product labels for {currentBranch?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                Label Settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Label Settings</SheetTitle>
                <SheetDescription>
                  Customize how your product labels will appear
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Label Size</Label>
                  <Select value={labelSize} onValueChange={(v) => setLabelSize(v as LabelSize)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (50×25mm)</SelectItem>
                      <SelectItem value="medium">Medium (70×40mm)</SelectItem>
                      <SelectItem value="large">Large (100×60mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Code Type</Label>
                  <Select value={labelType} onValueChange={(v) => setLabelType(v as LabelType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barcode">
                        <div className="flex items-center gap-2">
                          <Barcode className="h-4 w-4" />
                          Barcode Only
                        </div>
                      </SelectItem>
                      <SelectItem value="qr">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          QR Code Only
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center gap-2">
                          <Barcode className="h-4 w-4" />
                          Both
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Labels per Product</Label>
                  <Select
                    value={labelsPerProduct.toString()}
                    onValueChange={(v) => setLabelsPerProduct(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} label{n > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Columns per Row</Label>
                  <Select value={columns.toString()} onValueChange={(v) => setColumns(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} columns
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Display Options</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showPrice"
                      checked={showPrice}
                      onCheckedChange={(c) => setShowPrice(!!c)}
                    />
                    <Label htmlFor="showPrice" className="font-normal">
                      Show Price
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showWeight"
                      checked={showWeight}
                      onCheckedChange={(c) => setShowWeight(!!c)}
                    />
                    <Label htmlFor="showWeight" className="font-normal">
                      Show Weight
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showHUID"
                      checked={showHUID}
                      onCheckedChange={(c) => setShowHUID(!!c)}
                    />
                    <Label htmlFor="showHUID" className="font-normal">
                      Show HUID
                    </Label>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            onClick={() => handlePrint()}
            disabled={selectedProducts.size === 0}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Labels ({selectedProducts.size})
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Select Products</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    <CheckSquare className="mr-1 h-4 w-4" />
                    All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAll}>
                    <Square className="mr-1 h-4 w-4" />
                    None
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Metal</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : products?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No products in stock</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products?.map((product) => (
                        <TableRow
                          key={product.id}
                          className="cursor-pointer"
                          onClick={() => toggleProduct(product.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.has(product.id)}
                              onCheckedChange={() => toggleProduct(product.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.huid && (
                                <p className="text-xs text-muted-foreground">
                                  HUID: {product.huid}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.item_code}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {product.metal_type} {product.purity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatWeight(product.net_weight)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Label Preview</CardTitle>
              <CardDescription>
                Preview how your labels will look when printed
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
              {previewProduct ? (
                <ProductLabel
                  product={previewProduct}
                  size={labelSize}
                  type={labelType}
                  showPrice={showPrice}
                  showWeight={showWeight}
                  showHUID={showHUID}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No products available for preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedProducts.size > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Print Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Selected Products</span>
                    <span className="font-medium">{selectedProducts.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labels per Product</span>
                    <span className="font-medium">{labelsPerProduct}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Total Labels</span>
                    <span className="font-bold text-primary">
                      {selectedProducts.size * labelsPerProduct}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden Print Area */}
      <div className="hidden">
        <LabelPrintSheet
          ref={printRef}
          products={selectedProductsList}
          labelsPerProduct={labelsPerProduct}
          size={labelSize}
          type={labelType}
          showPrice={showPrice}
          showWeight={showWeight}
          showHUID={showHUID}
          columns={columns}
        />
      </div>
    </div>
  );
}
