import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  className?: string;
}

export function QRCodeGenerator({
  value,
  size = 100,
  errorCorrectionLevel = "M",
  className,
}: QRCodeGeneratorProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        errorCorrectionLevel,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then(setDataUrl)
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [value, size, errorCorrectionLevel]);

  if (!value) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded text-muted-foreground text-xs"
        style={{ width: size, height: size }}
      >
        No QR data
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      width={size}
      height={size}
      className={className}
    />
  );
}
