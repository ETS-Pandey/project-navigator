import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Receipt,
  Users,
  Landmark,
  PiggyBank,
  ClipboardList,
  Calculator,
  UserCog,
  Wallet,
  BarChart3,
  Settings,
  Gem,
  ChevronDown,
  Hammer,
  ShoppingCart,
  Flame,
  FileCheck,
  Diamond,
  Globe,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const iconMap = {
  LayoutDashboard,
  TrendingUp,
  Package,
  Receipt,
  Users,
  Landmark,
  PiggyBank,
  ClipboardList,
  Calculator,
  UserCog,
  Wallet,
  BarChart3,
  Settings,
  Hammer,
  ShoppingCart,
  Flame,
  FileCheck,
  Diamond,
  Globe,
};

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Rates",
    url: "/rates",
    icon: "TrendingUp",
    children: [
      { title: "Set Today's Rates", url: "/rates" },
      { title: "Rate History", url: "/rates/history" },
    ],
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
    title: "Purchase",
    url: "/purchase",
    icon: "ShoppingCart",
    children: [
      { title: "Vendors", url: "/purchase/vendors" },
      { title: "Purchases", url: "/purchase/list" },
      { title: "New Purchase", url: "/purchase/new" },
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
      { title: "Tally Export", url: "/accounting/tally" },
    ],
  },
  {
    title: "Karigars",
    url: "/karigars",
    icon: "Hammer",
  },
  {
    title: "Stone Inventory",
    url: "/stones",
    icon: "Diamond",
    children: [
      { title: "Stones", url: "/stones/inventory" },
      { title: "Stone Lots", url: "/stones/lots" },
    ],
  },
  {
    title: "Melting",
    url: "/melting",
    icon: "Flame",
    children: [
      { title: "Melting Batches", url: "/melting/batches" },
      { title: "Refining Records", url: "/melting/refining" },
    ],
  },
  {
    title: "Appraisals",
    url: "/appraisals",
    icon: "FileCheck",
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
    children: [
      { title: "All Expenses", url: "/expenses" },
      { title: "Petty Cash", url: "/expenses/petty-cash" },
      { title: "Payroll", url: "/expenses/payroll" },
      { title: "Budgets", url: "/expenses/budgets" },
    ],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: "BarChart3",
  },
  {
    title: "Online Catalog",
    url: "/catalog",
    icon: "Globe",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: "Settings",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActiveRoute = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Gem className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground">
              JewelPro
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const isActive = isActiveRoute(item.url);
                const hasChildren = item.children && item.children.length > 0;

                if (hasChildren) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.url}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink
                                    to={child.url}
                                    className="hover:bg-sidebar-accent/50"
                                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  >
                                    {child.title}
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
