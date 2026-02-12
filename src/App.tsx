import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BranchProvider } from "@/contexts/BranchContext";
import { RateProvider } from "@/contexts/RateContext";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Rates from "./pages/Rates";
import RateHistory from "./pages/rates/RateHistory";
import NotFound from "./pages/NotFound";

// Inventory Pages
import Products from "./pages/inventory/Products";
import ProductDetail from "./pages/inventory/ProductDetail";
import Categories from "./pages/inventory/Categories";
import ProductForm from "./pages/inventory/ProductForm";
import StockOperations from "./pages/inventory/StockOperations";
import Barcodes from "./pages/inventory/Barcodes";

// Billing Pages
import Invoices from "./pages/billing/Invoices";
import InvoiceDetail from "./pages/billing/InvoiceDetail";
import NewInvoice from "./pages/billing/NewInvoice";
import Quotations from "./pages/billing/Quotations";
import QuotationDetail from "./pages/billing/QuotationDetail";
import NewQuotation from "./pages/billing/NewQuotation";
import OldGold from "./pages/billing/OldGold";

// Customer Pages
import Customers from "./pages/customers/Customers";
import CustomerDetail from "./pages/customers/CustomerDetail";

// Loan Pages
import ActiveLoans from "./pages/loans/ActiveLoans";
import NewLoan from "./pages/loans/NewLoan";
import LoanDetail from "./pages/loans/LoanDetail";
import Collections from "./pages/loans/Collections";

// Scheme Pages
import SchemesList from "./pages/schemes/SchemesList";
import SchemeDetail from "./pages/schemes/SchemeDetail";
import Enrollments from "./pages/schemes/Enrollments";
import EnrollmentDetail from "./pages/schemes/EnrollmentDetail";
import SchemePayments from "./pages/schemes/SchemePayments";

// Order Pages
import RepairOrders from "./pages/orders/RepairOrders";
import CustomOrders from "./pages/orders/CustomOrders";

// Expense Pages
import ExpensesList from "./pages/expenses/ExpensesList";
import PettyCash from "./pages/expenses/PettyCash";
import Payroll from "./pages/expenses/Payroll";
import Budgets from "./pages/expenses/Budgets";

// Purchase Pages
import VendorList from "./pages/purchase/VendorList";
import PurchasesList from "./pages/purchase/PurchasesList";
import NewPurchase from "./pages/purchase/NewPurchase";

// Stone Inventory Pages
import StoneInventoryPage from "./pages/stones/StoneInventoryPage";
import StoneLotsPage from "./pages/stones/StoneLotsPage";

// Melting Pages
import MeltingPage from "./pages/melting/MeltingPage";
import RefiningPage from "./pages/melting/RefiningPage";

// Appraisal Pages
import AppraisalListPage from "./pages/appraisal/AppraisalListPage";
import AppraisalDetailPage from "./pages/appraisal/AppraisalDetailPage";
import NewAppraisalPage from "./pages/appraisal/NewAppraisalPage";

// Accounting Pages
import DayBook from "./pages/accounting/DayBook";
import ChartOfAccountsPage from "./pages/accounting/ChartOfAccountsPage";
import Ledgers from "./pages/accounting/Ledgers";
import BankBook from "./pages/accounting/BankBook";
import AccountingReports from "./pages/accounting/Reports";
import TallyExportPage from "./pages/accounting/TallyExportPage";

// Reports Pages
import ReportsPage from "./pages/reports/ReportsPage";

// Settings Pages
import SettingsPage from "./pages/settings/SettingsPage";

// Staff Pages
import StaffList from "./pages/staff/StaffList";

// Karigar Pages
import KarigarList from "./pages/karigar/KarigarList";

// Catalog Pages (Public)
import CatalogLayout from "./pages/catalog/CatalogLayout";
import CatalogPage from "./pages/catalog/CatalogPage";
import CatalogProductDetail from "./pages/catalog/CatalogProductDetail";
import CatalogCart from "./pages/catalog/CatalogCart";

// Portal Pages (Customer)
import PortalLogin from "./pages/portal/PortalLogin";
import PortalDashboard from "./pages/portal/PortalDashboard";

// Layout
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BranchProvider>
            <RateProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {/* App Routes (Protected) */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/rates" element={<Rates />} />
                  <Route path="/rates/history" element={<RateHistory />} />
                  
                  {/* Inventory Routes */}
                  <Route path="/inventory/products" element={<Products />} />
                  <Route path="/inventory/products/new" element={<ProductForm />} />
                  <Route path="/inventory/products/:id" element={<ProductDetail />} />
                  <Route path="/inventory/products/:id/edit" element={<ProductForm />} />
                  <Route path="/inventory/categories" element={<Categories />} />
                  <Route path="/inventory/stock" element={<StockOperations />} />
                  <Route path="/inventory/barcodes" element={<Barcodes />} />
                  
                  {/* Billing Routes */}
                  <Route path="/billing/invoices" element={<Invoices />} />
                  <Route path="/billing/invoices/:id" element={<InvoiceDetail />} />
                  <Route path="/billing/new" element={<NewInvoice />} />
                  <Route path="/billing/quotations" element={<Quotations />} />
                  <Route path="/billing/quotations/new" element={<NewQuotation />} />
                  <Route path="/billing/quotations/:id" element={<QuotationDetail />} />
                  <Route path="/billing/old-gold" element={<OldGold />} />
                  
                  {/* Customer Routes */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  
                  {/* Loan Routes */}
                  <Route path="/loans/active" element={<ActiveLoans />} />
                  <Route path="/loans/new" element={<NewLoan />} />
                  <Route path="/loans/collections" element={<Collections />} />
                  <Route path="/loans/:id" element={<LoanDetail />} />
                  
                  {/* Scheme Routes */}
                  <Route path="/schemes" element={<SchemesList />} />
                  <Route path="/schemes/:id" element={<SchemeDetail />} />
                  <Route path="/schemes/enrollments" element={<Enrollments />} />
                  <Route path="/schemes/enrollments/:id" element={<EnrollmentDetail />} />
                  <Route path="/schemes/payments" element={<SchemePayments />} />
                  
                  {/* Staff Routes */}
                  <Route path="/staff" element={<StaffList />} />
                  
                  {/* Karigar Routes */}
                  <Route path="/karigars" element={<KarigarList />} />
                  
                  {/* Order Routes */}
                  <Route path="/orders/repairs" element={<RepairOrders />} />
                  <Route path="/orders/custom" element={<CustomOrders />} />
                  
                  {/* Expense Routes */}
                  <Route path="/expenses" element={<ExpensesList />} />
                  <Route path="/expenses/petty-cash" element={<PettyCash />} />
                  <Route path="/expenses/payroll" element={<Payroll />} />
                  <Route path="/expenses/budgets" element={<Budgets />} />
                  
                  {/* Purchase Routes */}
                  <Route path="/purchase/vendors" element={<VendorList />} />
                  <Route path="/purchase/list" element={<PurchasesList />} />
                  <Route path="/purchase/new" element={<NewPurchase />} />
                  
                  {/* Stone Inventory Routes */}
                  <Route path="/stones/inventory" element={<StoneInventoryPage />} />
                  <Route path="/stones/lots" element={<StoneLotsPage />} />
                  
                  {/* Melting Routes */}
                  <Route path="/melting/batches" element={<MeltingPage />} />
                  <Route path="/melting/refining" element={<RefiningPage />} />
                  
                  {/* Appraisal Routes */}
                  <Route path="/appraisals" element={<AppraisalListPage />} />
                  <Route path="/appraisals/new" element={<NewAppraisalPage />} />
                  <Route path="/appraisals/:id" element={<AppraisalDetailPage />} />
                  
                  {/* Accounting Routes */}
                  <Route path="/accounting/daybook" element={<DayBook />} />
                  <Route path="/accounting/chart-of-accounts" element={<ChartOfAccountsPage />} />
                  <Route path="/accounting/ledgers" element={<Ledgers />} />
                  <Route path="/accounting/bank" element={<BankBook />} />
                  <Route path="/accounting/reports" element={<AccountingReports />} />
                  <Route path="/accounting/tally" element={<TallyExportPage />} />
                  
                  {/* Settings Routes */}
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* Reports Routes */}
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>

                {/* Public Catalog Routes */}
                <Route element={<CatalogLayout />}>
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/catalog/:id" element={<CatalogProductDetail />} />
                  <Route path="/catalog/cart" element={<CatalogCart />} />
                </Route>

                {/* Customer Portal Routes */}
                <Route path="/portal" element={<PortalLogin />} />
                <Route path="/portal/dashboard" element={<PortalDashboard />} />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RateProvider>
          </BranchProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
