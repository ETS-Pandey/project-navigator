import { forwardRef } from "react";
import { format, parseISO } from "date-fns";
import { formatCurrency, formatWeight, numberToWords } from "@/lib/formatters";
import type { Loan, LoanCollateral } from "@/types/loans";

interface LoanAgreementPrintTemplateProps {
  loan: Loan;
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
  };
}

export const LoanAgreementPrintTemplate = forwardRef<HTMLDivElement, LoanAgreementPrintTemplateProps>(
  ({ loan, businessInfo }, ref) => {
    const defaultBusiness = {
      name: "Your Jewellery Store",
      address: "123 Main Street, City - 400001",
      phone: "+91 98765 43210",
      email: "info@jewellerystore.com",
      gstin: "27AABCU9603R1ZM",
    };

    const business = businessInfo || defaultBusiness;
    const collaterals = loan.collaterals || [];
    const totalNetWeight = collaterals.reduce((sum, c) => sum + c.net_weight, 0);
    const totalGrossWeight = collaterals.reduce((sum, c) => sum + c.gross_weight, 0);

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

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold border-2 border-black inline-block px-8 py-2">
            GOLD LOAN AGREEMENT
          </h2>
        </div>

        {/* Loan & Customer Details */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
          <div>
            <h3 className="font-bold border-b border-gray-400 pb-1 mb-2">Borrower Details:</h3>
            <p className="font-medium text-base">{loan.customer?.name || "Customer"}</p>
            {loan.customer?.phone && <p>Phone: {loan.customer.phone}</p>}
            <p>Customer Code: {loan.customer?.customer_code}</p>
          </div>
          <div className="text-right">
            <table className="ml-auto text-sm">
              <tbody>
                <tr>
                  <td className="pr-4 font-medium">Loan No:</td>
                  <td className="font-bold text-base">{loan.loan_number}</td>
                </tr>
                <tr>
                  <td className="pr-4 font-medium">Date:</td>
                  <td>{format(parseISO(loan.loan_date), "dd/MM/yyyy")}</td>
                </tr>
                <tr>
                  <td className="pr-4 font-medium">Due Date:</td>
                  <td className="font-medium">{format(parseISO(loan.due_date), "dd/MM/yyyy")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Loan Summary Box */}
        <div className="border-2 border-black p-4 mb-6 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 uppercase">Loan Amount</p>
              <p className="text-lg font-bold">{formatCurrency(loan.loan_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Collateral Value</p>
              <p className="text-lg font-bold">{formatCurrency(loan.collateral_value)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Interest Rate</p>
              <p className="text-lg font-bold">{loan.interest_rate}% p.a.</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Tenure</p>
              <p className="text-lg font-bold">{loan.tenure_months} Months</p>
            </div>
          </div>
        </div>

        {/* Loan Terms */}
        <div className="mb-6">
          <h3 className="font-bold text-sm border-b border-gray-400 pb-1 mb-2">Loan Terms:</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between border-b border-gray-200 py-1">
              <span className="text-gray-600">Interest Type:</span>
              <span className="font-medium capitalize">{loan.interest_type}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-1">
              <span className="text-gray-600">LTV Ratio:</span>
              <span className="font-medium">{loan.ltv_percent.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-1">
              <span className="text-gray-600">Principal:</span>
              <span className="font-medium">{formatCurrency(loan.loan_amount)}</span>
            </div>
          </div>
        </div>

        {/* Collateral Details */}
        <div className="mb-6">
          <h3 className="font-bold text-sm border-b border-gray-400 pb-1 mb-2">Pledged Ornaments:</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-left">S.No</th>
                <th className="border border-gray-400 p-2 text-left">Description</th>
                <th className="border border-gray-400 p-2 text-center">Metal/Purity</th>
                <th className="border border-gray-400 p-2 text-right">Gross Wt.</th>
                <th className="border border-gray-400 p-2 text-right">Net Wt.</th>
                <th className="border border-gray-400 p-2 text-right">Rate/g</th>
                <th className="border border-gray-400 p-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {collaterals.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-gray-400 p-2">{index + 1}</td>
                  <td className="border border-gray-400 p-2 font-medium">{item.item_description}</td>
                  <td className="border border-gray-400 p-2 text-center capitalize">
                    {item.metal_type} - {item.purity}
                  </td>
                  <td className="border border-gray-400 p-2 text-right">{formatWeight(item.gross_weight)}</td>
                  <td className="border border-gray-400 p-2 text-right">{formatWeight(item.net_weight)}</td>
                  <td className="border border-gray-400 p-2 text-right">{formatCurrency(item.rate_per_gram)}</td>
                  <td className="border border-gray-400 p-2 text-right font-medium">{formatCurrency(item.item_value)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="border border-gray-400 p-2" colSpan={3}>Total</td>
                <td className="border border-gray-400 p-2 text-right">{formatWeight(totalGrossWeight)}</td>
                <td className="border border-gray-400 p-2 text-right">{formatWeight(totalNetWeight)}</td>
                <td className="border border-gray-400 p-2"></td>
                <td className="border border-gray-400 p-2 text-right">{formatCurrency(loan.collateral_value)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="border-t border-b border-gray-400 py-2 mb-4 text-sm">
          <p><strong>Loan Amount in Words:</strong> {numberToWords(loan.loan_amount)}</p>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6">
          <h3 className="font-bold text-sm border-b border-gray-400 pb-1 mb-2">Terms & Conditions:</h3>
          <ol className="text-xs space-y-1 list-decimal list-inside">
            <li>The borrower pledges the above ornaments as security for the loan amount.</li>
            <li>Interest will be calculated on {loan.interest_type} basis at {loan.interest_rate}% per annum.</li>
            <li>The loan tenure is {loan.tenure_months} months from the date of disbursement.</li>
            <li>The borrower agrees to repay the principal and accrued interest on or before the due date.</li>
            <li>In case of default, the lender reserves the right to auction the pledged ornaments after giving due notice.</li>
            <li>Part payments towards principal or interest can be made at any time during the loan tenure.</li>
            <li>The pledged ornaments will be stored safely and insured by the lender.</li>
            <li>The borrower can redeem the ornaments only after full repayment of principal and interest.</li>
            <li>Penal interest may be charged for overdue amounts as per applicable rates.</li>
            <li>This agreement is subject to the jurisdiction of local courts.</li>
          </ol>
        </div>

        {/* Declaration */}
        <div className="mb-8 p-3 border border-gray-400 text-xs bg-gray-50">
          <p className="font-bold mb-1">Declaration:</p>
          <p>
            I, the undersigned, hereby confirm that I have pledged the above-mentioned ornaments of my own free will 
            and understand all the terms and conditions mentioned above. I agree to abide by all terms of this 
            loan agreement and acknowledge receipt of the loan amount of{" "}
            <strong>{formatCurrency(loan.loan_amount)}</strong>.
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div>
            <div className="border-t border-black pt-2 w-48">
              <p className="text-xs font-medium">Borrower's Signature</p>
              <p className="text-xs text-gray-600 mt-1">{loan.customer?.name}</p>
            </div>
            <div className="mt-8">
              <p className="text-xs">Date: ___________________</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold mb-12">For {business.name}</p>
            <div className="border-t border-black pt-2 w-48 ml-auto">
              <p className="text-xs font-medium">Authorized Signatory</p>
            </div>
            <div className="mt-8 text-left ml-auto w-48">
              <p className="text-xs">Date: ___________________</p>
            </div>
          </div>
        </div>

        {/* Witness Section */}
        <div className="mt-8 border-t border-gray-300 pt-4">
          <p className="text-xs font-bold mb-4">Witness:</p>
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <p>1. Name: ___________________________</p>
              <p className="mt-2">   Address: _________________________</p>
              <p className="mt-2">   Signature: ________________________</p>
            </div>
            <div>
              <p>2. Name: ___________________________</p>
              <p className="mt-2">   Address: _________________________</p>
              <p className="mt-2">   Signature: ________________________</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
          <p>This is a computer-generated document. Original signature required for validity.</p>
          <p className="mt-1">Loan Agreement No: {loan.loan_number} | Generated on: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </div>
      </div>
    );
  }
);

LoanAgreementPrintTemplate.displayName = "LoanAgreementPrintTemplate";
