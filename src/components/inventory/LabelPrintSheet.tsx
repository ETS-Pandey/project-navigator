import { forwardRef } from "react";
import { ProductLabel, LabelProduct, LabelSize, LabelType } from "./ProductLabel";

interface LabelPrintSheetProps {
  products: LabelProduct[];
  labelsPerProduct?: number;
  size?: LabelSize;
  type?: LabelType;
  showPrice?: boolean;
  showWeight?: boolean;
  showHUID?: boolean;
  shopName?: string;
  columns?: number;
}

export const LabelPrintSheet = forwardRef<HTMLDivElement, LabelPrintSheetProps>(
  (
    {
      products,
      labelsPerProduct = 1,
      size = "medium",
      type = "barcode",
      showPrice = true,
      showWeight = true,
      showHUID = true,
      shopName = "JewelPro",
      columns = 3,
    },
    ref
  ) => {
    // Expand products based on labelsPerProduct
    const expandedProducts = products.flatMap((product) =>
      Array(labelsPerProduct).fill(product)
    );

    return (
      <div ref={ref} className="bg-white p-4">
        <style>
          {`
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          `}
        </style>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
        >
          {expandedProducts.map((product, index) => (
            <ProductLabel
              key={`${product.id}-${index}`}
              product={product}
              size={size}
              type={type}
              showPrice={showPrice}
              showWeight={showWeight}
              showHUID={showHUID}
              shopName={shopName}
            />
          ))}
        </div>
      </div>
    );
  }
);

LabelPrintSheet.displayName = "LabelPrintSheet";
