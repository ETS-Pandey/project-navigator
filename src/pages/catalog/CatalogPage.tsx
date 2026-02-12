import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, SlidersHorizontal, Gem, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatalogProducts, useCatalogCategories } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [metalType, setMetalType] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "weight">("newest");

  const { data: products, isLoading } = useCatalogProducts({
    search: search || undefined,
    categoryId: categoryId !== "all" ? categoryId : undefined,
    metalType: metalType !== "all" ? metalType : undefined,
    sortBy,
  });
  const { data: categories } = useCatalogCategories();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl gold-gradient p-8 text-center text-primary-foreground">
        <h1 className="text-3xl font-bold md:text-4xl">Our Collection</h1>
        <p className="mx-auto mt-2 max-w-xl text-primary-foreground/80">
          Browse our exquisite jewellery collection. Prices update with live gold &amp; silver rates.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jewellery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={metalType} onValueChange={setMetalType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Metal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Metals</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low-High</SelectItem>
            <SelectItem value="price_desc">Price: High-Low</SelectItem>
            <SelectItem value="weight">Weight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading..." : `${products?.length || 0} items found`}
      </p>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Gem className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No items found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products?.map((product: any) => {
            const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url
              || product.images?.[0]?.image_url;

            return (
              <Link key={product.id} to={`/catalog/${product.id}`}>
                <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                  <AspectRatio ratio={1}>
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Gem className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </AspectRatio>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {product.category?.name} • {product.purity} {product.metal_type}
                        </p>
                      </div>
                      {product.is_featured && (
                        <Star className="h-4 w-4 shrink-0 fill-primary text-primary" />
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(product.mrp || product.total_cost)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {product.gross_weight}g
                      </Badge>
                    </div>
                    {product.is_hallmarked && (
                      <Badge className="mt-1 text-[10px]" variant="secondary">
                        BIS Hallmarked
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
