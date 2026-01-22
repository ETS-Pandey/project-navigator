

# JewelPro Implementation Plan
## India's Most Comprehensive Jewellery Shop Management System

---

## Executive Summary

JewelPro is a comprehensive jewellery shop management system built with React, Tailwind CSS, and Supabase. This plan outlines the implementation of 21 integrated modules covering inventory, billing, loans, accounting, and customer engagement for multi-branch jewellery retailers in India.

---

## Part 1: Technical Architecture

### 1.1 Project Structure

```text
src/
+-- components/
|   +-- ui/                    # shadcn/ui components (existing)
|   +-- layout/                # App shell, sidebar, header
|   +-- dashboard/             # Dashboard widgets
|   +-- inventory/             # Product forms, stock operations
|   +-- billing/               # Invoice, payment, old gold
|   +-- customers/             # Customer management
|   +-- loans/                 # Loan management components
|   +-- schemes/               # Savings scheme components
|   +-- accounting/            # Ledger, journals, reports
|   +-- reports/               # Report generators
|   +-- catalog/               # Online catalog components
|   +-- portal/                # Customer portal components
|   +-- common/                # Shared components (data tables, forms)
+-- hooks/
|   +-- use-auth.ts            # Authentication hook
|   +-- use-branch.ts          # Branch context
|   +-- use-daily-rates.ts     # Rate management
|   +-- use-permissions.ts     # Role-based access
+-- lib/
|   +-- supabase.ts            # Supabase client
|   +-- constants.ts           # App constants
|   +-- calculations.ts        # Pricing, GST, interest
|   +-- formatters.ts          # Currency, weight, date
|   +-- validators.ts          # Zod schemas
+-- pages/
|   +-- auth/                  # Login, register
|   +-- dashboard/             # Main dashboard
|   +-- inventory/             # Stock management pages
|   +-- billing/               # Invoice pages
|   +-- customers/             # Customer pages
|   +-- loans/                 # Loan pages
|   +-- schemes/               # Scheme pages
|   +-- accounting/            # Accounting pages
|   +-- reports/               # Report pages
|   +-- settings/              # Configuration pages
|   +-- catalog/               # Public catalog
|   +-- portal/                # Customer portal
+-- contexts/
|   +-- AuthContext.tsx        # Auth state
|   +-- BranchContext.tsx      # Branch selection
|   +-- RateContext.tsx        # Daily rates
+-- types/
|   +-- database.ts            # Supabase types
|   +-- models.ts              # Business models
```

### 1.2 Database Schema Overview

The database consists of 50+ tables organized into logical groups:

**Core Tables (10 tables)**
- profiles, user_roles, branches, user_branch_access
- daily_rates, rate_history, cash_registers, day_end_records
- categories, sub_categories

**Inventory Tables (8 tables)**
- products, product_images, product_stones, stock_movements
- barcodes, hallmark_batches, hallmark_items

**Customer/Vendor Tables (6 tables)**
- customers, customer_documents, customer_addresses
- vendors, vendor_documents, vendor_bank_details

**Billing Tables (5 tables)**
- invoices, invoice_items, payments, old_gold_transactions
- quotations

**Accounting Tables (8 tables)**
- chart_of_accounts, journal_entries, journal_entry_lines
- bank_accounts, bank_reconciliation, bank_statements
- gst_returns, tally_exports

**Loan Tables (5 tables)**
- loans, loan_collaterals, loan_payments
- loan_interest_accruals, loan_auctions

**Scheme Tables (4 tables)**
- savings_schemes, scheme_enrollments, scheme_payments
- scheme_maturity

**Operations Tables (8 tables)**
- repair_orders, custom_orders, karigar_profiles
- karigar_assignments, melt_batches, refining_records
- stones, stone_certifications

**Staff Tables (6 tables)**
- staff_profiles, commission_slabs, sales_targets
- staff_sales, commission_calculations, incentive_payouts

**Expense Tables (5 tables)**
- expense_categories, expenses, expense_attachments
- budgets, salary_records

**Portal Tables (5 tables)**
- catalog_settings, catalog_items, customer_enquiries
- portal_notifications, customer_wishlists

**Appraisal Tables (3 tables)**
- appraisal_requests, appraisal_items, appraisal_certificates

---

## Part 2: Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
**Priority: CRITICAL - Must complete first**

**Goals:**
- Establish project structure and design system
- Implement authentication with role-based access
- Create main layout with navigation
- Build dashboard shell

**Database Tables:**
```sql
-- profiles (linked to auth.users)
-- user_roles (with app_role enum)
-- branches
-- user_branch_access
-- daily_rates
-- rate_history
```

**Key Components:**
1. **App Shell Layout**
   - Collapsible sidebar with module navigation
   - Header with branch selector, user menu
   - Gold/silver rate display strip
   - Responsive for desktop/tablet/mobile

2. **Authentication System**
   - Login page with phone/email options
   - Role-based routing and permissions
   - Branch-based access control
   - Session management

3. **Dashboard**
   - Rate display cards with update button
   - Sales summary widgets (today/week/month)
   - Alert notification panel
   - Quick action floating buttons
   - Recent activity feed

4. **Daily Rate Management**
   - Rate entry form (Gold: 24K, 22K, 18K, 14K; Silver: 999, 925)
   - Auto-calculate lower purity from 24K
   - Rate history with chart visualization
   - Wholesale vs retail rate toggle

**Technical Deliverables:**
- Supabase project connection
- RLS policies for user_roles table
- has_role() security definer function
- BranchContext and RateContext providers
- usePermissions hook for access control

---

### Phase 2: Inventory Core (Weeks 4-6)
**Priority: HIGH**

**Goals:**
- Product category management
- Complete product entry with all fields
- Basic stock operations
- Image upload to Supabase Storage

**Database Tables:**
```sql
-- categories
-- sub_categories
-- products (40+ fields)
-- product_images
-- product_stones
-- stock_movements
-- barcodes
```

**Key Components:**
1. **Category Management**
   - Pre-defined jewellery categories (15+ types)
   - Sub-category creation
   - Category icons/images
   - Display order configuration

2. **Product Entry Form**
   - Multi-step form with sections:
     - Basic info (code, name, category)
     - Weight details (gross, stone, net, wastage)
     - Metal details (type, purity, color)
     - Making charges (per gram/percentage/flat)
     - Stone details (type, count, weight, value)
     - HUID/Hallmark info
     - Pricing (cost, MRP, wholesale)
     - Images (primary + gallery)
     - Stock location

3. **Stock Operations**
   - Stock receipt (purchase, karigar, transfer)
   - Stock issue (sale, karigar, transfer)
   - Stock adjustment with reason
   - Stock transfer between branches

4. **Inventory Reports**
   - Stock register
   - Category-wise stock
   - Purity-wise stock
   - Low stock alerts
   - HUID pending items

---

### Phase 3: Barcode & Labeling (Week 7)
**Priority: HIGH - Required for billing**

**Goals:**
- Barcode generation for products
- Label template designer
- Print queue management
- Barcode scanning integration

**Key Components:**
1. **Barcode Generation**
   - Auto-generate Code 128 barcodes
   - QR code with item details link
   - Batch barcode assignment

2. **Label Templates**
   - Small/Medium/Large/Hanging tag templates
   - Template builder with drag-drop fields
   - Preview before print
   - Bulk printing queue

3. **Scanning Integration**
   - Camera-based scanning
   - Bluetooth scanner support
   - Scan-to-lookup functionality

---

### Phase 4: Customer Management (Week 8)
**Priority: HIGH - Required for billing**

**Goals:**
- Customer profile management
- KYC document storage
- Credit limit tracking
- Customer search and lookup

**Database Tables:**
```sql
-- customers
-- customer_documents
-- customer_addresses
-- customer_loyalty (points, tier)
```

**Key Components:**
1. **Customer Profile**
   - Basic info (name, phone, email, DOB, anniversary)
   - Multiple addresses
   - KYC documents upload
   - Credit limit and current balance
   - Purchase history summary

2. **Quick Customer Add**
   - Inline form during billing
   - Phone number lookup
   - Duplicate detection

3. **Customer Search**
   - Search by phone, name, ID
   - Advanced filters
   - Customer cards view

---

### Phase 5: Billing System (Weeks 9-11)
**Priority: CRITICAL**

**Goals:**
- Complete invoice creation workflow
- GST calculation (CGST/SGST/IGST)
- Old gold adjustment
- Multiple payment modes
- Invoice printing

**Database Tables:**
```sql
-- invoices
-- invoice_items
-- payments
-- old_gold_transactions
-- quotations
```

**Key Components:**
1. **Invoice Screen**
   - Customer selection/creation
   - Customer type (Retail/Wholesale/B2B)
   - Item entry methods:
     - Barcode scan
     - Item code entry
     - Search and select
   - Line items table with:
     - Description, weights, purity
     - Auto-calculated metal value
     - Making charges
     - Stone charges
     - Item total

2. **Old Gold Module**
   - Add old gold items
   - Purity testing entry
   - Deduction calculation
   - Value determination
   - Apply to invoice

3. **Payment Collection**
   - Multiple payment modes (Cash, Card, UPI, NEFT, Cheque, Credit)
   - Split payment support
   - Change calculation for cash
   - Reference number capture

4. **GST Calculation**
   - GSTIN entry for B2B
   - Place of supply for IGST
   - HSN code mapping
   - Tax breakup (CGST 1.5% + SGST 1.5% or IGST 3%)

5. **Invoice Actions**
   - Print invoice
   - WhatsApp share
   - Email invoice
   - Edit (same day)
   - Cancel with reason
   - Create credit note

6. **Quotation System**
   - Create quotation
   - Validity period
   - Convert to invoice
   - Follow-up tracking

---

### Phase 6: Purchase Module (Weeks 12-13)
**Priority: HIGH**

**Goals:**
- Vendor management
- Purchase entry with stock addition
- Vendor payments
- Purchase returns

**Database Tables:**
```sql
-- vendors
-- vendor_documents
-- purchases
-- purchase_items
-- vendor_payments
```

**Key Components:**
1. **Vendor Management**
   - Vendor profile (company, contact, GSTIN)
   - Credit terms configuration
   - Bank details for payment
   - Document uploads

2. **Purchase Entry**
   - Purchase types (Bullion, Finished, Stones)
   - Item-wise entry with full details
   - GST input credit tracking
   - Auto stock addition

3. **Vendor Ledger**
   - Transaction history
   - Running balance
   - Payment recording
   - Outstanding aging

---

### Phase 7: Accounting Foundation (Weeks 14-16)
**Priority: HIGH**

**Goals:**
- Chart of accounts setup
- Journal entry system
- Auto-entries from transactions
- Basic books (Day book, Cash book, Bank book)

**Database Tables:**
```sql
-- chart_of_accounts
-- journal_entries
-- journal_entry_lines
-- bank_accounts
```

**Key Components:**
1. **Chart of Accounts**
   - Pre-defined structure (Assets, Liabilities, Capital, Income, Expenses)
   - Account creation and management
   - Opening balance entry

2. **Journal Entries**
   - Manual journal entry screen
   - Debit/Credit line items
   - Auto-generated entries from:
     - Sales invoices
     - Purchases
     - Payments received/made
     - Expenses

3. **Books**
   - Day book (all transactions)
   - Cash book (cash transactions)
   - Bank book per account
   - Ledger account view

4. **Bank Reconciliation**
   - Import bank statement (CSV)
   - Match transactions
   - Reconciliation report

---

### Phase 8: Financial Reports (Weeks 17-18)
**Priority: HIGH**

**Goals:**
- Trial balance
- Profit & Loss statement
- Balance sheet
- GST reports for filing

**Key Components:**
1. **Trial Balance**
   - Period-end balances
   - Debit/Credit columns
   - Adjustments view

2. **Profit & Loss**
   - Income summary
   - Cost of goods sold
   - Gross profit
   - Operating expenses
   - Net profit

3. **Balance Sheet**
   - Assets (current + fixed)
   - Liabilities (current + long-term)
   - Capital and reserves

4. **GST Reports**
   - GSTR-1 format data
   - GSTR-3B summary
   - Input vs output summary

---

### Phase 9: Tally Integration (Week 19)
**Priority: MEDIUM**

**Goals:**
- Export masters in Tally XML format
- Export vouchers
- Validation and verification

**Key Components:**
1. **Masters Export**
   - Ledger accounts
   - Stock groups and items
   - Cost centers

2. **Voucher Export**
   - Sales, Purchase, Receipt, Payment, Journal vouchers
   - Date range selection
   - Incremental export

3. **Validation**
   - Pre-export checks
   - Count and value matching

---

### Phase 10: Staff & Incentives (Weeks 20-22)
**Priority: MEDIUM**

**Goals:**
- Staff profile management
- Commission structure configuration
- Sales target management
- Performance tracking and payouts

**Database Tables:**
```sql
-- staff_profiles
-- commission_slabs
-- sales_targets
-- staff_sales
-- commission_calculations
-- incentive_payouts
```

**Key Components:**
1. **Staff Management**
   - Profile with photo, documents
   - Branch assignment
   - Role and access

2. **Commission Setup**
   - Slab-based configuration
   - Category-based rates
   - Making charges commission

3. **Target Management**
   - Monthly/quarterly targets
   - Revenue/weight/count targets
   - Achievement tracking

4. **Performance Dashboard**
   - Leaderboard
   - Individual performance
   - Commission calculator
   - Payout processing

---

### Phase 11: Expense Tracking (Weeks 23-24)
**Priority: MEDIUM**

**Goals:**
- Expense categories and entry
- Petty cash management
- Salary/payroll processing
- Budget management

**Database Tables:**
```sql
-- expense_categories
-- expenses
-- expense_attachments
-- budgets
-- salary_records
```

**Key Components:**
1. **Expense Entry**
   - Category-based entry
   - Receipt upload
   - GST input tracking
   - Recurring expenses

2. **Petty Cash**
   - Branch-wise fund
   - Daily entries
   - Replenishment

3. **Payroll**
   - Salary configuration
   - Monthly processing
   - Payslip generation

4. **Budgets**
   - Category budgets
   - Tracking vs actual
   - Overspend alerts

---

### Phase 12: Repair & Custom Orders (Weeks 25-27)
**Priority: MEDIUM**

**Goals:**
- Repair order workflow
- Custom order management
- Karigar assignment
- Status tracking with notifications

**Database Tables:**
```sql
-- repair_orders
-- custom_orders
-- karigar_profiles
-- karigar_assignments
```

**Key Components:**
1. **Repair Orders**
   - Order creation with photos
   - Estimation and advance
   - Status workflow
   - Weight tracking (before/after)
   - Final billing

2. **Custom Orders**
   - Design reference upload
   - Specifications capture
   - Production tracking
   - Material issue tracking

3. **Order Dashboard**
   - All pending orders
   - Due today/overdue
   - Calendar view

---

### Phase 13: Stone Inventory (Weeks 28-29)
**Priority: MEDIUM**

**Goals:**
- Loose stone management
- 4Cs classification for diamonds
- Certification tracking
- Stone operations (issue, set, sell)

**Database Tables:**
```sql
-- stones
-- stone_certifications
-- stone_movements
```

**Key Components:**
1. **Stone Entry**
   - Type, shape, carat
   - 4Cs for diamonds
   - Certification details
   - Pricing

2. **Stone Operations**
   - Issue to karigar
   - Set in jewellery
   - Loose sale
   - Returns

---

### Phase 14: Melting & Refining (Week 30)
**Priority: LOW**

**Goals:**
- Melt batch creation
- Refinery tracking
- Pure gold receipt

**Database Tables:**
```sql
-- melt_batches
-- refining_records
```

**Key Components:**
1. **Melt Batch**
   - Source selection (old gold, scrap)
   - Weight documentation
   - Melting process

2. **Refinery**
   - Dispatch tracking
   - Purity results
   - Pure gold receipt
   - Cost calculation

---

### Phase 15: Gold Loans (Weeks 31-34)
**Priority: HIGH**

**Goals:**
- Loan account creation
- Collateral management with photos
- Interest calculation (simple/compound)
- EMI/payment tracking
- Loan closure and renewal

**Database Tables:**
```sql
-- loans
-- loan_collaterals
-- loan_payments
-- loan_interest_accruals
```

**Key Components:**
1. **Loan Creation**
   - Customer selection with KYC
   - Collateral entry with photos
   - LTV calculation
   - Loan terms (rate, tenure)
   - Agreement generation

2. **Collateral Management**
   - Secure storage tracking
   - Daily revaluation
   - Margin call alerts

3. **Interest & Payments**
   - Interest calculation
   - EMI schedule
   - Payment recording
   - Receipt generation

4. **Loan Operations**
   - Full redemption
   - Partial release
   - Renewal
   - Auction process

5. **Loan Dashboard**
   - Active loans
   - Dues today
   - Overdue accounts
   - Portfolio summary

---

### Phase 16: Savings Schemes (Weeks 35-36)
**Priority: MEDIUM**

**Goals:**
- Scheme configuration
- Customer enrollment
- Monthly payment tracking
- Maturity and redemption

**Database Tables:**
```sql
-- savings_schemes
-- scheme_enrollments
-- scheme_payments
```

**Key Components:**
1. **Scheme Setup**
   - Scheme definition (duration, amount, bonus)
   - Terms and conditions

2. **Enrollment**
   - Customer enrollment
   - Agreement generation
   - First payment

3. **Payment Tracking**
   - Monthly payment entry
   - Receipt generation
   - Reminders

4. **Maturity**
   - Maturity notification
   - Redemption processing
   - Bonus application

---

### Phase 17: Appraisal System (Weeks 37-38)
**Priority: MEDIUM**

**Goals:**
- Appraisal request intake
- Evaluation workflow
- Certificate generation with QR
- Pricing and billing

**Database Tables:**
```sql
-- appraisal_requests
-- appraisal_items
-- appraisal_certificates
```

**Key Components:**
1. **Appraisal Request**
   - Customer details
   - Purpose selection
   - Items registration

2. **Evaluation**
   - Physical examination
   - Photography
   - Stone assessment
   - Valuation calculation

3. **Certificate**
   - Professional certificate format
   - QR code for verification
   - PDF generation
   - Email/WhatsApp delivery

---

### Phase 18: Online Catalog (Weeks 39-42)
**Priority: MEDIUM**

**Goals:**
- Public-facing product catalog
- Dynamic pricing based on daily rates
- Search and filters
- Enquiry system

**Database Tables:**
```sql
-- catalog_settings
-- catalog_items
-- customer_enquiries
```

**Key Components:**
1. **Catalog Setup**
   - Shop branding (logo, colors, banner)
   - Contact information
   - Terms and policies

2. **Item Publishing**
   - Publish/unpublish controls
   - Featured sections
   - Price display settings

3. **Customer View**
   - Category browsing
   - Item detail with gallery
   - Live price calculation
   - Wishlist (local storage)

4. **Enquiry System**
   - Enquiry form
   - WhatsApp enquiry
   - Staff assignment
   - Follow-up workflow

---

### Phase 19: Customer Portal (Weeks 43-46)
**Priority: MEDIUM**

**Goals:**
- Customer self-registration with OTP
- Purchase history access
- Scheme and loan status
- Loyalty program
- Order tracking

**Key Components:**
1. **Authentication**
   - Phone + OTP login
   - Account linking to shop records

2. **Portal Dashboard**
   - Welcome and stats
   - Recent activity
   - Upcoming dues

3. **Purchase History**
   - All invoices
   - Invoice detail with items
   - Download PDF

4. **Scheme & Loan Status**
   - Active schemes with schedule
   - Loan details with EMI calendar
   - Payment history

5. **Loyalty Program**
   - Points balance
   - Tier status
   - Earning/redemption history

6. **Notifications**
   - Payment reminders
   - Order updates
   - Promotions

---

### Phase 20: WhatsApp Integration (Weeks 47-48)
**Priority: LOW**

**Goals:**
- WhatsApp Business API setup
- Message templates
- Automated notifications
- Bulk messaging

**Key Components:**
1. **Integration Setup**
   - API configuration
   - Template creation and approval

2. **Automated Messages**
   - Invoice sharing
   - Payment reminders
   - Rate updates
   - Order status
   - Birthday wishes

3. **Manual Messaging**
   - Template-based sending
   - Bulk messaging to groups

---

### Phase 21: Final Polish (Weeks 49-52)
**Priority: HIGH**

**Goals:**
- Advanced analytics dashboard
- Performance optimization
- Mobile responsiveness
- Bug fixes
- Documentation

**Key Components:**
1. **Analytics Dashboard**
   - Sales trends
   - Inventory insights
   - Customer analytics
   - Staff performance

2. **Optimization**
   - Query optimization
   - Lazy loading
   - Image optimization
   - Caching

3. **Testing**
   - End-to-end testing
   - User acceptance testing
   - Performance testing

---

## Part 3: Key Technical Decisions

### 3.1 State Management
- **TanStack Query** for server state (Supabase data)
- **React Context** for app state (auth, branch, rates)
- **Local state** for UI state

### 3.2 Form Handling
- **React Hook Form** for all forms
- **Zod** for validation schemas
- Custom validation for jewellery-specific rules (weight, purity)

### 3.3 Calculation Engine
Centralized calculation utilities for:
- Metal value = Net Weight x Today's Rate
- GST (CGST/SGST 1.5% each or IGST 3%)
- Making charges (per gram or percentage)
- Loan interest (simple/compound)
- Commission calculations

### 3.4 Security Implementation
- RLS policies on all tables
- has_role() function for permission checks
- Branch-based data isolation
- Customer portal: auth.uid() filtering

### 3.5 Printing
- Invoice printing using print CSS
- Label printing with canvas/SVG
- PDF generation for certificates

---

## Part 4: Immediate Next Steps

To begin implementation, I recommend starting with **Phase 1: Foundation** which includes:

1. **Set up Supabase** - Connect and configure the database
2. **Create core tables** - profiles, user_roles, branches, daily_rates
3. **Implement authentication** - Login with role-based access
4. **Build app shell** - Sidebar navigation, header, layout
5. **Create dashboard** - Rate display, quick actions, alerts

Would you like me to proceed with Phase 1 implementation?

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Billing time | Reduced by 60% |
| Inventory accuracy | > 99% |
| Customer enquiry response | < 2 hours |
| Scheme collection rate | > 95% |
| Page load time | < 2 seconds |
| Uptime | 99.9% |

