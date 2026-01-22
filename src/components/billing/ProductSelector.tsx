import { useState } from "react";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";
import { formatCurrency, formatWeight } from "@/lib/formatters";
import type { Product } from "@/types/inventory";

interface ProductSelectorProps {
  onSelect: (product: Product) => void;
  disabled?: boolean;
}

export function ProductSelector({ onSelect, disabled }: ProductSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const { data: products = [], isLoading } = useProducts({ 
    search: search || undefined,
    status: "in_stock"
  });
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Search products to add...
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search by name, code, or barcode..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No products found."}
            </CommandEmpty>
            <CommandGroup>
              {products.slice(0, 20).map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    onSelect(product);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-start gap-3 p-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {product.item_code}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="capitalize">{product.metal_type} {product.purity}</span>
                      <span>{formatWeight(product.gross_weight)}</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(product.mrp || product.total_cost || 0)}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
