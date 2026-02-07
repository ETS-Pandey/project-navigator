import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useToast } from "@/hooks/use-toast";

// Tally XML escape utility
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatTallyDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// Build Tally XML for ledger masters
function buildLedgerMastersXml(accounts: any[]): string {
  const tallyAccountTypeMap: Record<string, string> = {
    asset: "Current Assets",
    liability: "Current Liabilities",
    equity: "Capital Account",
    income: "Direct Incomes",
    expense: "Direct Expenses",
  };

  const ledgers = accounts
    .map(
      (acc) => `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <LEDGER NAME="${escapeXml(acc.account_name)}" ACTION="Create">
        <NAME.LIST>
          <NAME>${escapeXml(acc.account_name)}</NAME>
        </NAME.LIST>
        <PARENT>${tallyAccountTypeMap[acc.account_type] || "Sundry Debtors"}</PARENT>
        <OPENINGBALANCE>${acc.opening_balance >= 0 ? acc.opening_balance : `-${Math.abs(acc.opening_balance)}`}</OPENINGBALANCE>
        <DESCRIPTION>${escapeXml(acc.description || "")}</DESCRIPTION>
      </LEDGER>
    </TALLYMESSAGE>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>JewelPro</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${ledgers}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

// Build Tally XML for vouchers (journal entries)
function buildVoucherXml(entries: any[]): string {
  const vouchers = entries
    .map((entry) => {
      const lines = (entry.lines || [])
        .map((line: any) => {
          const amount = (line.debit_amount || 0) - (line.credit_amount || 0);
          const isDr = amount >= 0;
          return `
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(line.account?.account_name || "Unknown")}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>${isDr ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
            <AMOUNT>${isDr ? Math.abs(amount) : `-${Math.abs(amount)}`}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
        })
        .join("");

      const voucherType = mapReferenceTypeToVoucherType(entry.reference_type);

      return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
        <DATE>${formatTallyDate(entry.entry_date)}</DATE>
        <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
        <VOUCHERNUMBER>${escapeXml(entry.entry_number)}</VOUCHERNUMBER>
        <NARRATION>${escapeXml(entry.narration || "")}</NARRATION>
        <EFFECTIVEDATE>${formatTallyDate(entry.entry_date)}</EFFECTIVEDATE>
        ${lines}
      </VOUCHER>
    </TALLYMESSAGE>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>JewelPro</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${vouchers}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

function mapReferenceTypeToVoucherType(refType: string | null): string {
  switch (refType) {
    case "sale":
    case "invoice":
      return "Sales";
    case "purchase":
      return "Purchase";
    case "receipt":
    case "payment_received":
      return "Receipt";
    case "payment":
    case "payment_made":
    case "expense":
      return "Payment";
    default:
      return "Journal";
  }
}

// Build stock items XML
function buildStockItemsXml(products: any[], categories: any[]): string {
  const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

  const items = products
    .map(
      (p) => `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <STOCKITEM NAME="${escapeXml(p.name)}" ACTION="Create">
        <NAME.LIST>
          <NAME>${escapeXml(p.name)}</NAME>
        </NAME.LIST>
        <PARENT>${escapeXml(categoryMap.get(p.category_id) || "Primary")}</PARENT>
        <BASEUNITS>pcs</BASEUNITS>
        <OPENINGBALANCE>${p.stock_quantity || 0} pcs</OPENINGBALANCE>
        <OPENINGVALUE>${p.cost_price || 0}</OPENINGVALUE>
        <DESCRIPTION>${escapeXml(p.item_code || "")}</DESCRIPTION>
      </STOCKITEM>
    </TALLYMESSAGE>`
    )
    .join("\n");

  const groups = categories
    .map(
      (c: any) => `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <STOCKGROUP NAME="${escapeXml(c.name)}" ACTION="Create">
        <NAME.LIST>
          <NAME>${escapeXml(c.name)}</NAME>
        </NAME.LIST>
        <PARENT>Primary</PARENT>
      </STOCKGROUP>
    </TALLYMESSAGE>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>JewelPro</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${groups}
${items}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

function downloadXml(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useTallyExport() {
  const { currentBranch } = useBranch();
  const { toast } = useToast();

  const exportLedgerMasters = async () => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .eq("is_active", true)
        .order("account_code");
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ title: "No accounts to export", variant: "destructive" });
        return 0;
      }
      const xml = buildLedgerMastersXml(data);
      downloadXml(xml, `tally-ledger-masters-${new Date().toISOString().split("T")[0]}.xml`);
      toast({ title: `Exported ${data.length} ledger accounts` });
      return data.length;
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
      return 0;
    }
  };

  const exportVouchers = async (dateFrom: string, dateTo: string) => {
    try {
      if (!currentBranch?.id) throw new Error("No branch selected");

      const { data: entries, error: entriesError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .gte("entry_date", dateFrom)
        .lte("entry_date", dateTo)
        .order("entry_date");
      if (entriesError) throw entriesError;
      if (!entries || entries.length === 0) {
        toast({ title: "No vouchers in date range", variant: "destructive" });
        return 0;
      }

      // Fetch lines with account details for each entry
      const entryIds = entries.map((e) => e.id);
      const { data: lines, error: linesError } = await supabase
        .from("journal_entry_lines")
        .select("*, account:chart_of_accounts(*)")
        .in("journal_entry_id", entryIds);
      if (linesError) throw linesError;

      const entriesWithLines = entries.map((entry) => ({
        ...entry,
        lines: (lines || []).filter((l) => l.journal_entry_id === entry.id),
      }));

      const xml = buildVoucherXml(entriesWithLines);
      downloadXml(xml, `tally-vouchers-${dateFrom}-to-${dateTo}.xml`);
      toast({ title: `Exported ${entries.length} vouchers` });
      return entries.length;
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
      return 0;
    }
  };

  const exportStockItems = async () => {
    try {
      if (!currentBranch?.id) throw new Error("No branch selected");

      // Use separate queries to avoid deep type instantiation
      const prodQuery = supabase.from("products").select("id, name, item_code, category_id, stock_quantity, cost_price, is_active");
      const productsRes = await prodQuery.eq("branch_id", currentBranch.id);
      if (productsRes.error) throw productsRes.error;

      const catQuery = supabase.from("categories").select("id, name, code");
      const categoriesRes = await catQuery.eq("is_active", true);
      if (categoriesRes.error) throw categoriesRes.error;

      const products = (productsRes.data || []).filter((p: any) => p.is_active);
      const categories = categoriesRes.data || [];

      if (products.length === 0) {
        toast({ title: "No products to export", variant: "destructive" });
        return 0;
      }

      const xml = buildStockItemsXml(products, categories);
      downloadXml(xml, `tally-stock-items-${new Date().toISOString().split("T")[0]}.xml`);
      toast({ title: `Exported ${products.length} stock items and ${categories.length} groups` });
      return products.length;
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
      return 0;
    }
  };

  return {
    exportLedgerMasters,
    exportVouchers,
    exportStockItems,
  };
}