import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Heart, Share2, Gem, Shield, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function CatalogProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["catalog-product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, code),
          images:product_images(id, image_url, is_primary, display_order),
          stones:product_stones(*)
        `)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("catalog_cart") || "[]");
    const exists = cart.find((item: any) => item.productId === id);
    if (exists) {
      exists.quantity += 1;
    } else {
      cart.push({
        productId: id,
        productName: product?.name,
        quantity: 1,
        estimatedPrice: product?.mrp || product?.total_cost || 0,
        weight: product?.gross_weight,
        purity: product?.purity,
        metalType: product?.metal_type,
      });
    }
    localStorage.setItem("catalog_cart", JSON.stringify(cart));
    toast({ title: "Added to inquiry cart" });
    window.dispatchEvent(new Event("cart-updated"));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Gem className="h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-semibold">Product not found</h3>
        <Link to="/catalog">
          <Button variant="link">Back to catalog</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];

  return (
    <div className="space-y-6">
      <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to collection
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border bg-muted">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]?.image_url}
                alt={product.name}
                className="h-96 w-full object-contain"
              />
            ) : (
              <div className="flex h-96 items-center justify-center">
                <Gem className="h-16 w-16 text-muted-foreground/20" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === selectedImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{product.category?.name}</p>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground">Code: {product.item_code}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(product.mrp || product.total_cost)}
            </span>
            {product.mrp && product.mrp !== product.total_cost && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.total_cost)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{product.purity} {product.metal_type}</Badge>
            <Badge variant="outline" className="capitalize">{product.metal_color?.replace("_", " ")}</Badge>
            {product.is_hallmarked && <Badge variant="secondary"><Shield className="mr-1 h-3 w-3" /> BIS Hallmarked</Badge>}
            {product.huid && <Badge variant="secondary">HUID: {product.huid}</Badge>}
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}

          <Separator />

          {/* Weight Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Scale className="h-4 w-4" /> Weight Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Gross Weight</span>
              <span className="text-right font-medium">{product.gross_weight}g</span>
              <span className="text-muted-foreground">Net Weight</span>
              <span className="text-right font-medium">{product.net_weight}g</span>
              {product.stone_weight > 0 && (
                <>
                  <span className="text-muted-foreground">Stone Weight</span>
                  <span className="text-right font-medium">{product.stone_weight}g</span>
                </>
              )}
              <span className="text-muted-foreground">Wastage</span>
              <span className="text-right font-medium">{product.wastage_percent}%</span>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Metal Value</span>
              <span className="text-right font-medium">{formatCurrency(product.metal_value)}</span>
              <span className="text-muted-foreground">Making Charges</span>
              <span className="text-right font-medium">{formatCurrency(product.making_charge_amount)}</span>
              {product.stone_value > 0 && (
                <>
                  <span className="text-muted-foreground">Stone Value</span>
                  <span className="text-right font-medium">{formatCurrency(product.stone_value)}</span>
                </>
              )}
              <Separator className="col-span-2 my-1" />
              <span className="font-semibold">Total</span>
              <span className="text-right font-bold text-primary">{formatCurrency(product.mrp || product.total_cost)}</span>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={addToCart} className="flex-1 gold-gradient text-primary-foreground">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Inquiry
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            * Prices are indicative and based on current market rates. Final price confirmed at billing.
          </p>
        </div>
      </div>
    </div>
  );
}
