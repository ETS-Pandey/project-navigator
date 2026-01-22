// JewelPro Formatting Utilities

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Format weight in grams (up to 3 decimal places)
 */
export function formatWeight(grams: number): string {
  return `${grams.toFixed(3)} g`;
}

/**
 * Format weight in grams (short form)
 */
export function formatWeightShort(grams: number): string {
  return `${grams.toFixed(2)}g`;
}

/**
 * Format date in Indian format (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date for display (e.g., "22 Jan 2026")
 */
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return formatDateDisplay(d);
}

/**
 * Format phone number (Indian format)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Format GSTIN
 */
export function formatGSTIN(gstin: string): string {
  const cleaned = gstin.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 2)}${cleaned.slice(2, 12)}${cleaned.slice(12)}`;
  }
  return gstin;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format rate change (with arrow indicator)
 */
export function formatRateChange(current: number, previous: number): {
  text: string;
  direction: "up" | "down" | "same";
  percentage: number;
} {
  const diff = current - previous;
  const percentage = previous > 0 ? (diff / previous) * 100 : 0;
  
  if (diff > 0) {
    return {
      text: `+${formatCurrency(diff)}`,
      direction: "up",
      percentage,
    };
  } else if (diff < 0) {
    return {
      text: formatCurrency(diff),
      direction: "down",
      percentage,
    };
  }
  
  return {
    text: "No change",
    direction: "same",
    percentage: 0,
  };
}

/**
 * Format invoice number
 */
export function formatInvoiceNumber(
  prefix: string,
  number: number,
  padding = 6
): string {
  return `${prefix}${String(number).padStart(padding, "0")}`;
}

/**
 * Format item code
 */
export function formatItemCode(
  categoryCode: string,
  serialNumber: number,
  branchCode?: string
): string {
  const serial = String(serialNumber).padStart(5, "0");
  return branchCode
    ? `${branchCode}-${categoryCode}-${serial}`
    : `${categoryCode}-${serial}`;
}

/**
 * Convert number to words (Indian format for invoices)
 */
export function numberToWords(num: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const numToWords = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = numToWords(rupees) + " Rupees";
  if (paise > 0) {
    result += " and " + numToWords(paise) + " Paise";
  }
  result += " Only";

  return result;
}
