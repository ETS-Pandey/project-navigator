import { supabase } from "@/integrations/supabase/client";

interface JournalLineInput {
  account_code: string;
  debit?: number;
  credit?: number;
  narration?: string;
}

interface CreateJournalEntryParams {
  branchId: string;
  entryDate: string;
  narration: string;
  referenceType: 'invoice' | 'payment' | 'expense' | 'scheme_payment' | 'manual';
  referenceId?: string;
  lines: JournalLineInput[];
}

async function getAccountByCode(code: string) {
  const { data } = await supabase
    .from("chart_of_accounts")
    .select("id")
    .eq("account_code", code)
    .single();
  return data?.id;
}

export async function createJournalEntry({
  branchId,
  entryDate,
  narration,
  referenceType,
  referenceId,
  lines,
}: CreateJournalEntryParams): Promise<string | null> {
  try {
    // Generate entry number
    const { data: lastEntry } = await supabase
      .from("journal_entries")
      .select("entry_number")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const lastNum = lastEntry?.entry_number
      ? parseInt(lastEntry.entry_number.replace(/\D/g, ""))
      : 0;
    const entryNumber = `JE${String(lastNum + 1).padStart(6, "0")}`;

    // Resolve account codes to IDs
    const resolvedLines = await Promise.all(
      lines.map(async (line) => ({
        account_id: await getAccountByCode(line.account_code),
        debit_amount: line.debit || 0,
        credit_amount: line.credit || 0,
        narration: line.narration,
      }))
    );

    // Filter out lines without valid account IDs
    const validLines = resolvedLines.filter((line) => line.account_id);

    if (validLines.length < 2) {
      console.warn("Not enough valid accounts for journal entry");
      return null;
    }

    const totalDebit = validLines.reduce((sum, l) => sum + l.debit_amount, 0);
    const totalCredit = validLines.reduce((sum, l) => sum + l.credit_amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      console.warn("Journal entry not balanced:", { totalDebit, totalCredit });
      return null;
    }

    // Create journal entry
    const { data: entry, error: entryError } = await supabase
      .from("journal_entries")
      .insert({
        branch_id: branchId,
        entry_number: entryNumber,
        entry_date: entryDate,
        narration,
        reference_type: referenceType,
        reference_id: referenceId,
        total_debit: totalDebit,
        total_credit: totalCredit,
        is_posted: true,
      })
      .select()
      .single();

    if (entryError) {
      console.error("Failed to create journal entry:", entryError);
      return null;
    }

    // Create entry lines
    const linesToInsert = validLines.map((line) => ({
      journal_entry_id: entry.id,
      account_id: line.account_id,
      debit_amount: line.debit_amount,
      credit_amount: line.credit_amount,
      narration: line.narration,
    }));

    const { error: linesError } = await supabase
      .from("journal_entry_lines")
      .insert(linesToInsert);

    if (linesError) {
      console.error("Failed to create journal entry lines:", linesError);
      // Rollback entry
      await supabase.from("journal_entries").delete().eq("id", entry.id);
      return null;
    }

    return entry.id;
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return null;
  }
}

// Helper to create journal entry for sales invoice
export async function createInvoiceJournalEntry(
  branchId: string,
  invoiceId: string,
  invoiceNumber: string,
  invoiceDate: string,
  grandTotal: number,
  cgstAmount: number,
  sgstAmount: number,
  igstAmount: number
) {
  const totalGst = (cgstAmount || 0) + (sgstAmount || 0) + (igstAmount || 0);
  const salesAmount = grandTotal - totalGst;

  const lines: JournalLineInput[] = [
    {
      account_code: "1200", // Accounts Receivable
      debit: grandTotal,
      narration: `Invoice ${invoiceNumber}`,
    },
    {
      account_code: "4000", // Sales Revenue (Gold as default)
      credit: salesAmount,
      narration: `Sales from ${invoiceNumber}`,
    },
  ];

  // Add GST as single line
  if (totalGst > 0) {
    lines.push({
      account_code: "2200", // GST Payable
      credit: totalGst,
      narration: "GST on sales",
    });
  }

  return createJournalEntry({
    branchId,
    entryDate: invoiceDate,
    narration: `Sales Invoice: ${invoiceNumber}`,
    referenceType: "invoice",
    referenceId: invoiceId,
    lines,
  });
}

// Helper to create journal entry for payment received
export async function createPaymentJournalEntry(
  branchId: string,
  paymentId: string,
  paymentNumber: string,
  paymentDate: string,
  amount: number,
  paymentMode: string,
  invoiceNumber?: string
) {
  // Determine which asset account based on payment mode
  const assetAccountCode = paymentMode === "cash" ? "1000" : "1100"; // Cash or Bank

  return createJournalEntry({
    branchId,
    entryDate: paymentDate,
    narration: `Payment received${invoiceNumber ? ` for ${invoiceNumber}` : ""}: ${paymentNumber}`,
    referenceType: "payment",
    referenceId: paymentId,
    lines: [
      {
        account_code: assetAccountCode,
        debit: amount,
        narration: `${paymentMode.toUpperCase()} received`,
      },
      {
        account_code: "1200", // Accounts Receivable
        credit: amount,
        narration: `Payment against invoice`,
      },
    ],
  });
}

// Helper for scheme payment
export async function createSchemePaymentJournalEntry(
  branchId: string,
  paymentId: string,
  paymentNumber: string,
  paymentDate: string,
  amount: number,
  paymentMode: string,
  customerName?: string
) {
  const assetAccountCode = paymentMode === "cash" ? "1000" : "1100"; // Cash or Bank

  return createJournalEntry({
    branchId,
    entryDate: paymentDate,
    narration: `Scheme payment from ${customerName || "customer"}: ${paymentNumber}`,
    referenceType: "scheme_payment",
    referenceId: paymentId,
    lines: [
      {
        account_code: assetAccountCode,
        debit: amount,
        narration: `${paymentMode.toUpperCase()} received`,
      },
      {
        account_code: "2100", // Customer Advances (Scheme Deposits)
        credit: amount,
        narration: `Scheme deposit received`,
      },
    ],
  });
}
