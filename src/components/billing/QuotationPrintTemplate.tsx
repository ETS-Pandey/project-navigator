import { forwardRef } from "react";
import { formatCurrency, formatWeight, formatDate } from "@/lib/formatters";
import type { Quotation, QuotationItem } from "@/types/billing";

interface QuotationPrintTemplateProps {
  quotation: Quotation;
  items: QuotationItem[];
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
  };
}

// Convert number to words for Indian currency
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = '';
  
  if (rupees >= 10000000) {
    result += convertLessThanThousand(Math.floor(rupees / 10000000)) + ' Crore ';
    result += numberToWords(rupees % 10000000);
  } else if (rupees >= 100000) {
    result += convertLessThanThousand(Math.floor(rupees / 100000)) + ' Lakh ';
    result += numberToWords(rupees % 100000);
  } else if (rupees >= 1000) {
    result += convertLessThanThousand(Math.floor(rupees / 1000)) + ' Thousand ';
    result += convertLessThanThousand(rupees % 1000);
  } else {
    result = convertLessThanThousand(rupees);
  }
  
  result = result.trim() + ' Rupees';
  
  if (paise > 0) {
    result += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return result + ' Only';
}

export const QuotationPrintTemplate = forwardRef<HTMLDivElement, QuotationPrintTemplateProps>(
  ({ quotation, items, businessInfo }, ref) => {
    const defaultBusiness = {
      name: "Your Jewellery Store",
      address: "123 Main Street, City - 400001",
      phone: "+91 98765 43210",
      email: "info@jewellerystore.com",
      gstin: "27AABCU9603R1ZM",
    };
    
    const business = businessInfo || defaultBusiness;
    
    return (
      <div ref={ref} className="bg-white text-black p-8 max-w-[210mm] mx-auto print:p-6">
        <style>
          {`
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}
        </style>
        
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wide">{business.name}</h1>
            <p className="text-sm mt-1">{business.address}</p>
            <p className="text-sm">Phone: {business.phone} | Email: {business.email}</p>
            <p className="text-sm font-medium">GSTIN: {business.gstin}</p>
          </div>
        </div>
        
        {/* Quotation Title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold border-2 border-black inline-block px-8 py-1">
            QUOTATION
          </h2>
        </div>
        
        {/* Quotation & Customer Details */}
        <div className="grid grid-cols-2 gap-8 mb-4 text-sm">
          <div>
            <h3 className="font-bold border-b border-gray-400 pb-1 mb-2">Quotation For:</h3>
            <p className="font-medium">{quotation.customer_name || "Walk-in Customer"}</p>
            {quotation.customer_address && <p>{quotation.customer_address}</p>}
            {quotation.customer_phone && <p>Phone: {quotation.customer_phone}</p>}
            {quotation.customer_gstin && <p>GSTIN: {quotation.customer_gstin}</p>}
          </div>
          <div className="text-right">
            <table className="ml-auto text-sm">
              <tbody>
                <tr>
                  <td className="pr-4 font-medium">Quotation No:</td>
                  <td className="font-bold">{quotation.quotation_number}</td>
                </tr>
                <tr>
                  <td className="pr-4 font-medium">Date:</td>
                  <td>{formatDate(quotation.quotation_date)}</td>
                </tr>
                {quotation.valid_until && (
                  <tr>
                    <td className="pr-4 font-medium">Valid Until:</td>
                    <td>{formatDate(quotation.valid_until)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Items Table */}
        <table className="w-full border-collapse text-sm mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-left">S.No</th>
              <th className="border border-gray-400 p-2 text-left">Description</th>
              <th className="border border-gray-400 p-2 text-center">HSN</th>
              <th className="border border-gray-400 p-2 text-right">Wt (g)</th>
              <th className="border border-gray-400 p-2 text-right">Rate</th>
              <th className="border border-gray-400 p-2 text-right">Metal Value</th>
              <th className="border border-gray-400 p-2 text-right">Making</th>
              <th className="border border-gray-400 p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-gray-400 p-2">{index + 1}</td>
                <td className="border border-gray-400 p-2">
                  <div className="font-medium">{item.item_name}</div>
                  {item.item_code && <div className="text-xs text-gray-600">{item.item_code}</div>}
                  {item.metal_type && item.purity && (
                    <div className="text-xs text-gray-600 capitalize">
                      {item.metal_type} - {item.purity}
                    </div>
                  )}
                </td>
                <td className="border border-gray-400 p-2 text-center">{item.hsn_code}</td>
                <td className="border border-gray-400 p-2 text-right">
                  {item.gross_weight ? formatWeight(item.gross_weight) : "-"}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {item.rate_per_gram ? formatCurrency(item.rate_per_gram) : "-"}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {formatCurrency(item.metal_value || 0)}
                </td>
                <td className="border border-gray-400 p-2 text-right">
                  {formatCurrency(item.making_charges || 0)}
                </td>
                <td className="border border-gray-400 p-2 text-right font-medium">
                  {formatCurrency(item.taxable_amount || item.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Summary */}
        <div className="flex justify-end mb-4">
          <table className="text-sm w-72">
            <tbody>
              <tr>
                <td className="py-1 pr-4">Gross Amount:</td>
                <td className="py-1 text-right">{formatCurrency(quotation.gross_amount)}</td>
              </tr>
              {Number(quotation.discount_amount) > 0 && (
                <tr>
                  <td className="py-1 pr-4">Discount ({quotation.discount_percent}%):</td>
                  <td className="py-1 text-right">-{formatCurrency(quotation.discount_amount || 0)}</td>
                </tr>
              )}
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-4 font-medium">Taxable Amount:</td>
                <td className="py-1 text-right font-medium">{formatCurrency(quotation.taxable_amount)}</td>
              </tr>
              {quotation.is_interstate ? (
                <tr>
                  <td className="py-1 pr-4">IGST @ 3%:</td>
                  <td className="py-1 text-right">{formatCurrency(quotation.igst_amount || 0)}</td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td className="py-1 pr-4">CGST @ 1.5%:</td>
                    <td className="py-1 text-right">{formatCurrency(quotation.cgst_amount || 0)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">SGST @ 1.5%:</td>
                    <td className="py-1 text-right">{formatCurrency(quotation.sgst_amount || 0)}</td>
                  </tr>
                </>
              )}
              {Number(quotation.round_off) !== 0 && (
                <tr>
                  <td className="py-1 pr-4">Round Off:</td>
                  <td className="py-1 text-right">
                    {Number(quotation.round_off) > 0 ? "+" : ""}{formatCurrency(quotation.round_off || 0)}
                  </td>
                </tr>
              )}
              <tr className="border-t-2 border-black font-bold text-base">
                <td className="py-2 pr-4">Grand Total:</td>
                <td className="py-2 text-right">{formatCurrency(quotation.grand_total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Amount in Words */}
        <div className="border-t border-b border-gray-400 py-2 mb-4 text-sm">
          <p><strong>Amount in Words:</strong> {numberToWords(quotation.grand_total)}</p>
        </div>
        
        {/* Terms & Note */}
        <div className="text-xs mb-8">
          <h4 className="font-bold mb-1">Terms & Conditions:</h4>
          <ul className="list-disc list-inside text-xs">
            <li>This quotation is valid until {quotation.valid_until ? formatDate(quotation.valid_until) : "7 days from the date of issue"}</li>
            <li>Prices are subject to change based on daily metal rates</li>
            <li>GST will be applicable as per prevailing rates</li>
            <li>Making charges may vary based on design complexity</li>
          </ul>
          {quotation.notes && (
            <div className="mt-2">
              <h4 className="font-bold">Notes:</h4>
              <p>{quotation.notes}</p>
            </div>
          )}
        </div>
        
        {/* Signature */}
        <div className="flex justify-between items-end mt-12">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 w-40">
              <p className="text-xs">Customer Acceptance</p>
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold mb-8">For {business.name}</p>
            <div className="border-t border-gray-400 pt-1 w-40">
              <p className="text-xs">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

QuotationPrintTemplate.displayName = "QuotationPrintTemplate";
