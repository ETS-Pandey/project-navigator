// JewelPro Constants

// Gold purity percentages for calculation
export const GOLD_PURITY_PERCENTAGES = {
  "24K": 0.999,
  "22K": 0.916,
  "18K": 0.750,
  "14K": 0.585,
  "10K": 0.417,
} as const;

// Silver purity percentages
export const SILVER_PURITY_PERCENTAGES = {
  "999": 0.999,
  "925": 0.925,
  "900": 0.900,
  "800": 0.800,
} as const;

// Gold purities for forms
export const GOLD_PURITIES = [
  { value: "24K", label: "24K (999)" },
  { value: "22K", label: "22K (916)" },
  { value: "18K", label: "18K (750)" },
  { value: "14K", label: "14K (585)" },
] as const;

// Silver purities for forms
export const SILVER_PURITIES = [
  { value: "999", label: "999 Fine Silver" },
  { value: "925", label: "925 Sterling" },
  { value: "900", label: "900 Coin Silver" },
] as const;

// Metal colors for forms
export const METAL_COLORS = [
  { value: "yellow", label: "Yellow Gold" },
  { value: "white", label: "White Gold" },
  { value: "rose", label: "Rose Gold" },
  { value: "two_tone", label: "Two Tone" },
  { value: "tri_tone", label: "Tri Tone" },
] as const;

// Making charge types for forms
export const MAKING_CHARGE_TYPES = [
  { value: "per_gram", label: "Per Gram (₹/g)" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "flat", label: "Flat Amount (₹)" },
] as const;

// GST rates for jewellery in India
export const GST_RATES = {
  CGST: 1.5,
  SGST: 1.5,
  IGST: 3.0,
} as const;

// HSN codes for jewellery
export const HSN_CODES = {
  GOLD_JEWELLERY: "7113",
  SILVER_JEWELLERY: "7113",
  DIAMOND_JEWELLERY: "7113",
  PLATINUM_JEWELLERY: "7113",
  GOLD_COINS: "7118",
  SILVER_COINS: "7118",
  LOOSE_DIAMONDS: "7102",
  PRECIOUS_STONES: "7103",
} as const;

// Indian states for GST
export const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh (New)" },
  { code: "38", name: "Ladakh" },
] as const;

// Jewellery categories
export const JEWELLERY_CATEGORIES = [
  { id: "necklaces", name: "Necklaces & Necklace Sets", icon: "necklace" },
  { id: "bangles", name: "Bangles & Bracelets", icon: "circle" },
  { id: "rings", name: "Rings", icon: "ring" },
  { id: "earrings", name: "Earrings", icon: "earring" },
  { id: "chains", name: "Chains & Pendants", icon: "chain" },
  { id: "mangalsutra", name: "Mangalsutras", icon: "heart" },
  { id: "nose", name: "Nose Pins & Nose Rings", icon: "nose" },
  { id: "anklets", name: "Anklets (Payal)", icon: "anklet" },
  { id: "coins", name: "Coins & Bars", icon: "coin" },
  { id: "wedding", name: "Wedding Sets (Bridal)", icon: "wedding" },
  { id: "diamond", name: "Diamond Jewellery", icon: "diamond" },
  { id: "platinum", name: "Platinum Jewellery", icon: "platinum" },
  { id: "silver", name: "Silver Jewellery", icon: "silver" },
  { id: "watches", name: "Watches", icon: "watch" },
  { id: "idols", name: "Idols & Artifacts", icon: "idol" },
] as const;

// App role labels for display
export const ROLE_LABELS = {
  owner: "Owner",
  admin: "Administrator",
  branch_manager: "Branch Manager",
  accountant: "Accountant",
  sales_executive: "Sales Executive",
  loan_officer: "Loan Officer",
  appraiser: "Appraiser",
  catalog_manager: "Catalog Manager",
  karigar_admin: "Karigar Admin",
  auditor: "Auditor",
  customer: "Customer",
} as const;

// Navigation menu items
export const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Daily Rates",
    url: "/rates",
    icon: "TrendingUp",
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: "Package",
    children: [
      { title: "Products", url: "/inventory/products" },
      { title: "Categories", url: "/inventory/categories" },
      { title: "Stock Operations", url: "/inventory/stock" },
      { title: "Barcodes", url: "/inventory/barcodes" },
    ],
  },
  {
    title: "Billing",
    url: "/billing",
    icon: "Receipt",
    children: [
      { title: "New Invoice", url: "/billing/new" },
      { title: "Invoices", url: "/billing/invoices" },
      { title: "Quotations", url: "/billing/quotations" },
      { title: "Old Gold", url: "/billing/old-gold" },
    ],
  },
  {
    title: "Customers",
    url: "/customers",
    icon: "Users",
  },
  {
    title: "Loans",
    url: "/loans",
    icon: "Landmark",
    children: [
      { title: "Active Loans", url: "/loans/active" },
      { title: "New Loan", url: "/loans/new" },
      { title: "Collections", url: "/loans/collections" },
    ],
  },
  {
    title: "Schemes",
    url: "/schemes",
    icon: "PiggyBank",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: "ClipboardList",
    children: [
      { title: "Repairs", url: "/orders/repairs" },
      { title: "Custom Orders", url: "/orders/custom" },
    ],
  },
  {
    title: "Accounting",
    url: "/accounting",
    icon: "Calculator",
    children: [
      { title: "Day Book", url: "/accounting/daybook" },
      { title: "Ledgers", url: "/accounting/ledgers" },
      { title: "Bank Book", url: "/accounting/bank" },
      { title: "Reports", url: "/accounting/reports" },
    ],
  },
  {
    title: "Staff",
    url: "/staff",
    icon: "UserCog",
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: "Wallet",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: "BarChart3",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: "Settings",
  },
] as const;
