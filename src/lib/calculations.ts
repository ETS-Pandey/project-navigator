// JewelPro Calculation Utilities

import { GOLD_PURITY_PERCENTAGES, SILVER_PURITY_PERCENTAGES, GST_RATES } from "./constants";

/**
 * Calculate metal value based on weight and rate
 */
export function calculateMetalValue(
  weightGrams: number,
  ratePerGram: number
): number {
  return weightGrams * ratePerGram;
}

/**
 * Calculate net weight after deducting stone weight
 */
export function calculateNetWeight(
  grossWeight: number,
  stoneWeight: number
): number {
  return Math.max(0, grossWeight - stoneWeight);
}

/**
 * Calculate chargeable weight (net weight + wastage)
 */
export function calculateChargeableWeight(
  netWeight: number,
  wastagePercent: number
): number {
  return netWeight * (1 + wastagePercent / 100);
}

/**
 * Calculate making charges based on type
 */
export function calculateMakingCharges(
  metalValue: number,
  netWeight: number,
  options: {
    type: "per_gram" | "percentage" | "flat";
    value: number;
  }
): number {
  switch (options.type) {
    case "per_gram":
      return netWeight * options.value;
    case "percentage":
      return metalValue * (options.value / 100);
    case "flat":
      return options.value;
    default:
      return 0;
  }
}

/**
 * Calculate lower purity rate from 24K rate
 */
export function calculatePurityRate(
  rate24K: number,
  purity: keyof typeof GOLD_PURITY_PERCENTAGES
): number {
  return rate24K * GOLD_PURITY_PERCENTAGES[purity];
}

/**
 * Calculate silver purity rate from 999 rate
 */
export function calculateSilverPurityRate(
  rate999: number,
  purity: keyof typeof SILVER_PURITY_PERCENTAGES
): number {
  return rate999 * SILVER_PURITY_PERCENTAGES[purity];
}

/**
 * Calculate GST components
 */
export function calculateGST(
  taxableAmount: number,
  isInterstate: boolean
): {
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grandTotal: number;
} {
  if (isInterstate) {
    const igst = taxableAmount * (GST_RATES.IGST / 100);
    return {
      cgst: 0,
      sgst: 0,
      igst,
      totalGst: igst,
      grandTotal: taxableAmount + igst,
    };
  }

  const cgst = taxableAmount * (GST_RATES.CGST / 100);
  const sgst = taxableAmount * (GST_RATES.SGST / 100);
  return {
    cgst,
    sgst,
    igst: 0,
    totalGst: cgst + sgst,
    grandTotal: taxableAmount + cgst + sgst,
  };
}

/**
 * Calculate invoice total
 */
export function calculateInvoiceTotal(items: {
  metalValue: number;
  makingCharges: number;
  stoneValue: number;
  otherCharges: number;
}[]): number {
  return items.reduce((total, item) => {
    return total + item.metalValue + item.makingCharges + item.stoneValue + item.otherCharges;
  }, 0);
}

/**
 * Calculate old gold value
 */
export function calculateOldGoldValue(
  weight: number,
  purity: keyof typeof GOLD_PURITY_PERCENTAGES,
  rate24K: number,
  deductionPercent: number
): {
  pureGoldWeight: number;
  grossValue: number;
  deduction: number;
  netValue: number;
} {
  const purityFactor = GOLD_PURITY_PERCENTAGES[purity];
  const pureGoldWeight = weight * purityFactor;
  const grossValue = pureGoldWeight * rate24K;
  const deduction = grossValue * (deductionPercent / 100);
  const netValue = grossValue - deduction;

  return {
    pureGoldWeight,
    grossValue,
    deduction,
    netValue,
  };
}

/**
 * Calculate simple interest
 */
export function calculateSimpleInterest(
  principal: number,
  ratePerAnnum: number,
  days: number
): number {
  return (principal * ratePerAnnum * days) / (365 * 100);
}

/**
 * Calculate compound interest (monthly compounding)
 */
export function calculateCompoundInterest(
  principal: number,
  ratePerAnnum: number,
  months: number
): number {
  const monthlyRate = ratePerAnnum / 12 / 100;
  const amount = principal * Math.pow(1 + monthlyRate, months);
  return amount - principal;
}

/**
 * Calculate EMI
 */
export function calculateEMI(
  principal: number,
  ratePerAnnum: number,
  tenureMonths: number
): number {
  const monthlyRate = ratePerAnnum / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  
  return emi;
}

/**
 * Calculate Loan-to-Value (LTV) ratio
 */
export function calculateLTV(
  loanAmount: number,
  collateralValue: number
): number {
  if (collateralValue === 0) return 0;
  return (loanAmount / collateralValue) * 100;
}

/**
 * Calculate commission based on slabs
 */
export function calculateCommission(
  salesAmount: number,
  slabs: { minAmount: number; maxAmount: number; percentage: number }[]
): number {
  let commission = 0;
  let remaining = salesAmount;

  for (const slab of slabs.sort((a, b) => a.minAmount - b.minAmount)) {
    if (remaining <= 0) break;
    
    const slabMax = slab.maxAmount === 0 ? Infinity : slab.maxAmount;
    const applicableAmount = Math.min(
      remaining,
      slabMax - slab.minAmount
    );
    
    if (applicableAmount > 0) {
      commission += applicableAmount * (slab.percentage / 100);
      remaining -= applicableAmount;
    }
  }

  return commission;
}

/**
 * Round to nearest rupee (standard rounding)
 */
export function roundToRupee(amount: number): number {
  return Math.round(amount);
}

/**
 * Round off for invoice (50 paise rule)
 */
export function roundForInvoice(amount: number): {
  rounded: number;
  adjustment: number;
} {
  const rounded = Math.round(amount);
  return {
    rounded,
    adjustment: rounded - amount,
  };
}
