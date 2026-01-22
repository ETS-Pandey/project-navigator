import { forwardRef } from "react";
import { BarcodeGenerator } from "./BarcodeGenerator";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { formatCurrency, formatWeight } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface LabelProduct {
  id: string;
  item_code: string;
  barcode?: string;
  name: string;
  metal_type: string;
  purity: string;
  net_weight: number;
  total_cost?: number;
  huid?: string;
}

export type LabelSize = "small" | "medium" | "large";
export type LabelType = "barcode" | "qr" | "both";

interface ProductLabelProps {
  product: LabelProduct;
  size?: LabelSize;
  type?: LabelType;
  showPrice?: boolean;
  showWeight?: boolean;
  showHUID?: boolean;
  shopName?: string;
  className?: string;
}

const LABEL_SIZES = {
  small: { width: "50mm", height: "25mm", padding: "2mm" },
  medium: { width: "70mm", height: "40mm", padding: "3mm" },
  large: { width: "100mm", height: "60mm", padding: "4mm" },
};

export const ProductLabel = forwardRef<HTMLDivElement, ProductLabelProps>(
  (
    {
      product,
      size = "medium",
      type = "barcode",
      showPrice = true,
      showWeight = true,
      showHUID = true,
      shopName = "JewelPro",
      className,
    },
    ref
  ) => {
    const dimensions = LABEL_SIZES[size];
    const barcodeValue = product.barcode || product.item_code;
    const qrData = JSON.stringify({
      code: product.item_code,
      name: product.name,
      metal: `${product.metal_type} ${product.purity}`,
      weight: product.net_weight,
      huid: product.huid,
    });

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white text-black border border-gray-300 flex flex-col",
          className
        )}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          padding: dimensions.padding,
          fontFamily: "Arial, sans-serif",
          pageBreakInside: "avoid",
        }}
      >
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-1 mb-1">
          <div
            className="font-bold"
            style={{ fontSize: size === "small" ? "8px" : size === "medium" ? "10px" : "12px" }}
          >
            {shopName}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex gap-1">
          {/* Barcode/QR Section */}
          <div className="flex flex-col items-center justify-center">
            {(type === "barcode" || type === "both") && (
              <BarcodeGenerator
                value={barcodeValue}
                height={size === "small" ? 20 : size === "medium" ? 30 : 40}
                width={size === "small" ? 1 : 1.5}
                fontSize={size === "small" ? 8 : 10}
                displayValue={size !== "small"}
              />
            )}
            {(type === "qr" || type === "both") && (
              <QRCodeGenerator
                value={qrData}
                size={size === "small" ? 30 : size === "medium" ? 50 : 70}
              />
            )}
          </div>

          {/* Details Section */}
          <div
            className="flex-1 flex flex-col justify-center"
            style={{ fontSize: size === "small" ? "7px" : size === "medium" ? "9px" : "11px" }}
          >
            <div className="font-semibold truncate" title={product.name}>
              {product.name}
            </div>
            <div className="text-gray-600">
              {product.metal_type.toUpperCase()} {product.purity}
            </div>
            {showWeight && (
              <div>Wt: {formatWeight(product.net_weight)}</div>
            )}
            {showPrice && product.total_cost && (
              <div className="font-semibold">{formatCurrency(product.total_cost)}</div>
            )}
            {showHUID && product.huid && (
              <div className="text-gray-500">HUID: {product.huid}</div>
            )}
          </div>
        </div>

        {/* Footer - Item Code */}
        <div
          className="text-center border-t border-gray-200 pt-1 mt-1 font-mono"
          style={{ fontSize: size === "small" ? "6px" : size === "medium" ? "8px" : "10px" }}
        >
          {product.item_code}
        </div>
      </div>
    );
  }
);

ProductLabel.displayName = "ProductLabel";
