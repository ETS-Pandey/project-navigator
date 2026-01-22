import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  displayValue?: boolean;
  format?: "CODE128" | "CODE39" | "EAN13" | "UPC";
  className?: string;
}

export function BarcodeGenerator({
  value,
  width = 2,
  height = 50,
  fontSize = 14,
  displayValue = true,
  format = "CODE128",
  className,
}: BarcodeGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          fontSize,
          displayValue,
          margin: 5,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [value, width, height, fontSize, displayValue, format]);

  if (!value) {
    return (
      <div className="flex items-center justify-center h-16 bg-muted rounded text-muted-foreground text-sm">
        No barcode value
      </div>
    );
  }

  return <svg ref={svgRef} className={className} />;
}
