export interface BusinessSettings {
  id: string;
  branch_id: string | null;
  setting_key: string;
  setting_value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PrintTemplate {
  id: string;
  branch_id: string | null;
  template_type: string;
  template_name: string;
  header_content: {
    showLogo?: boolean;
    logoPosition?: 'left' | 'center' | 'right';
    showCompanyName?: boolean;
    showAddress?: boolean;
    showGSTIN?: boolean;
    showPhone?: boolean;
    showLicenseNumber?: boolean;
    shopName?: string;
  };
  footer_content: {
    showTerms?: boolean;
    showBankDetails?: boolean;
    showSignature?: boolean;
    showWitness?: boolean;
    showBorrowerSignature?: boolean;
    showLenderSignature?: boolean;
    showValidUntil?: boolean;
    showThankYou?: boolean;
    termsText?: string;
    thankYouText?: string;
  };
  body_settings: {
    showItemCode?: boolean;
    showHSN?: boolean;
    showWeight?: boolean;
    showPurity?: boolean;
    showMakingCharges?: boolean;
    showTax?: boolean;
    showCollateralDetails?: boolean;
    showInterestCalculation?: boolean;
    showDueDate?: boolean;
    showPaymentMode?: boolean;
    showReference?: boolean;
    showBarcode?: boolean;
    showQR?: boolean;
    showPrice?: boolean;
    showHUID?: boolean;
    labelSize?: 'small' | 'medium' | 'large';
  };
  page_settings: {
    pageSize?: 'A4' | 'A5' | 'Letter';
    orientation?: 'portrait' | 'landscape';
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    columns?: number;
    labelsPerProduct?: number;
  };
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  is_active: boolean;
  is_main_branch: boolean;
  created_at: string;
  updated_at: string;
}
