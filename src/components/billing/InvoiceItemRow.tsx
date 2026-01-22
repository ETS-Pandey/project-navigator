import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, formatWeight } from "@/lib/formatters";
import type { InvoiceItemFormData } from "@/types/billing";

interface InvoiceItemRowProps {
  item: InvoiceItemFormData;
  index: number;
  isInterstate: boolean;
  onUpdate: (index: number, field: keyof InvoiceItemFormData, value: unknown) => void;
  onRemove: (index: number) => void;
}

export function InvoiceItemRow({
  item,
  index,
  isInterstate,
  onUpdate,
  onRemove,
}: InvoiceItemRowProps) {
  // Calculate totals
  const subtotal = item.metal_value + item.making_charges + item.stone_value + item.other_charges;
  const discountAmount = subtotal * (item.discount_percent / 100);
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = isInterstate 
    ? taxableAmount * 0.03 
    : taxableAmount * 0.03;
  const totalAmount = taxableAmount + gstAmount;
  
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <div className="font-medium">{item.item_name}</div>
          <div className="text-xs text-muted-foreground">
            {item.item_code} | HSN: {item.hsn_code}
          </div>
          {item.metal_type && (
            <div className="text-xs text-muted-foreground capitalize">
              {item.metal_type} {item.purity} | Wt: {formatWeight(item.gross_weight || 0)}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          value={item.metal_value}
          onChange={(e) => onUpdate(index, "metal_value", parseFloat(e.target.value) || 0)}
          className="w-24 text-right"
          min={0}
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          value={item.making_charges}
          onChange={(e) => onUpdate(index, "making_charges", parseFloat(e.target.value) || 0)}
          className="w-24 text-right"
          min={0}
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          value={item.stone_value}
          onChange={(e) => onUpdate(index, "stone_value", parseFloat(e.target.value) || 0)}
          className="w-24 text-right"
          min={0}
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          value={item.discount_percent}
          onChange={(e) => onUpdate(index, "discount_percent", parseFloat(e.target.value) || 0)}
          className="w-16 text-right"
          min={0}
          max={100}
        />
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(taxableAmount)}
      </TableCell>
      <TableCell className="text-right text-muted-foreground">
        {formatCurrency(gstAmount)}
      </TableCell>
      <TableCell className="text-right font-bold">
        {formatCurrency(totalAmount)}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
