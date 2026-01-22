// Staff/User Management Types

export type AppRole = 
  | "owner"
  | "admin"
  | "branch_manager"
  | "accountant"
  | "sales_executive"
  | "loan_officer"
  | "appraiser"
  | "catalog_manager"
  | "karigar_admin"
  | "auditor"
  | "customer";

export const ROLE_LABELS: Record<AppRole, string> = {
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
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  owner: "Full system access with all permissions",
  admin: "Manage users, settings, and all business operations",
  branch_manager: "Manage branch operations, staff, and reports",
  accountant: "Handle payments, invoices, and financial records",
  sales_executive: "Process sales, quotations, and customer management",
  loan_officer: "Manage gold loans and collections",
  appraiser: "Evaluate and approve old gold purchases",
  catalog_manager: "Manage products, categories, and inventory",
  karigar_admin: "Manage karigar orders and job work",
  auditor: "View-only access to all records for auditing",
  customer: "Customer portal access only",
};

export interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  roles: AppRole[];
  branch_access: BranchAccess[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface BranchAccess {
  branch_id: string;
  branch_name: string;
  is_primary: boolean;
}

export interface StaffFormData {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  roles: AppRole[];
  branch_ids: string[];
  primary_branch_id?: string;
}

export interface StaffFilters {
  search?: string;
  role?: AppRole;
  branchId?: string;
  isActive?: boolean;
}
