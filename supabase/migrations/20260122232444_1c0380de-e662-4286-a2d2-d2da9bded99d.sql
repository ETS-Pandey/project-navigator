-- Create business_settings table for global business configuration
CREATE TABLE public.business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(branch_id, setting_key)
);

-- Create print_templates table for customizable print templates
CREATE TABLE public.print_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL, -- 'invoice', 'quotation', 'loan_agreement', 'receipt', 'label'
  template_name TEXT NOT NULL,
  header_content JSONB DEFAULT '{}', -- Logo, company name, address formatting
  footer_content JSONB DEFAULT '{}', -- Terms, bank details, signatures
  body_settings JSONB DEFAULT '{}', -- Column visibility, formatting options
  page_settings JSONB DEFAULT '{}', -- Page size, margins, orientation
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(branch_id, template_type, template_name)
);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_settings
CREATE POLICY "Users can view business settings for their branches"
  ON public.business_settings FOR SELECT
  USING (public.has_branch_access(auth.uid(), branch_id) OR branch_id IS NULL);

CREATE POLICY "Admins can manage business settings"
  ON public.business_settings FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

-- RLS policies for print_templates
CREATE POLICY "Users can view print templates for their branches"
  ON public.print_templates FOR SELECT
  USING (public.has_branch_access(auth.uid(), branch_id) OR branch_id IS NULL);

CREATE POLICY "Admins can manage print templates"
  ON public.print_templates FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

-- Triggers for updated_at
CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_print_templates_updated_at
  BEFORE UPDATE ON public.print_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default print templates
INSERT INTO public.print_templates (branch_id, template_type, template_name, header_content, footer_content, body_settings, page_settings, is_default) VALUES
(NULL, 'invoice', 'Default Invoice', 
  '{"showLogo": true, "logoPosition": "left", "showCompanyName": true, "showAddress": true, "showGSTIN": true, "showPhone": true}',
  '{"showTerms": true, "showBankDetails": true, "showSignature": true, "termsText": "Thank you for your business!"}',
  '{"showItemCode": true, "showHSN": true, "showWeight": true, "showPurity": true, "showMakingCharges": true, "showTax": true}',
  '{"pageSize": "A4", "orientation": "portrait", "marginTop": 10, "marginBottom": 10, "marginLeft": 10, "marginRight": 10}',
  true),
(NULL, 'quotation', 'Default Quotation',
  '{"showLogo": true, "logoPosition": "left", "showCompanyName": true, "showAddress": true, "showGSTIN": true, "showPhone": true}',
  '{"showTerms": true, "showValidUntil": true, "termsText": "Prices are subject to change based on gold rates."}',
  '{"showItemCode": true, "showWeight": true, "showPurity": true, "showMakingCharges": true}',
  '{"pageSize": "A4", "orientation": "portrait", "marginTop": 10, "marginBottom": 10, "marginLeft": 10, "marginRight": 10}',
  true),
(NULL, 'loan_agreement', 'Default Loan Agreement',
  '{"showLogo": true, "showCompanyName": true, "showAddress": true, "showLicenseNumber": true}',
  '{"showWitness": true, "showBorrowerSignature": true, "showLenderSignature": true, "showTerms": true}',
  '{"showCollateralDetails": true, "showInterestCalculation": true, "showDueDate": true}',
  '{"pageSize": "A4", "orientation": "portrait", "marginTop": 15, "marginBottom": 15, "marginLeft": 15, "marginRight": 15}',
  true),
(NULL, 'receipt', 'Default Receipt',
  '{"showLogo": true, "showCompanyName": true, "showAddress": true}',
  '{"showThankYou": true, "thankYouText": "Thank you for your payment!"}',
  '{"showPaymentMode": true, "showReference": true}',
  '{"pageSize": "A5", "orientation": "portrait", "marginTop": 5, "marginBottom": 5, "marginLeft": 5, "marginRight": 5}',
  true),
(NULL, 'label', 'Default Product Label',
  '{"showShopName": true, "shopName": "JewelPro"}',
  '{}',
  '{"showBarcode": true, "showQR": false, "showPrice": true, "showWeight": true, "showHUID": true, "labelSize": "medium"}',
  '{"columns": 3, "labelsPerProduct": 1}',
  true);