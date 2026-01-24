-- Create table for rate alert configurations
CREATE TABLE public.rate_alert_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  metal_type TEXT NOT NULL CHECK (metal_type IN ('gold', 'silver', 'platinum')),
  alert_threshold_percent NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  last_alerted_at TIMESTAMP WITH TIME ZONE,
  last_alerted_price NUMERIC(12,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, metal_type)
);

-- Create table to store cached live rates
CREATE TABLE public.live_market_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gold_rate_inr NUMERIC(12,2) NOT NULL,
  silver_rate_inr NUMERIC(12,2) NOT NULL,
  platinum_rate_inr NUMERIC(12,2),
  gold_rate_usd NUMERIC(12,2),
  silver_rate_usd NUMERIC(12,2),
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'api'
);

-- Create table for rate alerts history
CREATE TABLE public.rate_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  metal_type TEXT NOT NULL,
  previous_rate NUMERIC(12,2) NOT NULL,
  current_rate NUMERIC(12,2) NOT NULL,
  change_percent NUMERIC(8,4) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_market_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for rate_alert_configs
CREATE POLICY "Users can view alert configs for their branches"
ON public.rate_alert_configs FOR SELECT
USING (
  public.has_branch_access(auth.uid(), branch_id) OR
  public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[])
);

CREATE POLICY "Admins can manage alert configs"
ON public.rate_alert_configs FOR ALL
USING (
  public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager']::app_role[])
);

-- RLS policies for live_market_rates (read by all authenticated)
CREATE POLICY "Authenticated users can view live rates"
ON public.live_market_rates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert live rates"
ON public.live_market_rates FOR INSERT
WITH CHECK (true);

-- RLS policies for rate_alerts
CREATE POLICY "Users can view alerts for their branches"
ON public.rate_alerts FOR SELECT
USING (
  public.has_branch_access(auth.uid(), branch_id) OR
  public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[])
);

CREATE POLICY "Users can update alerts for their branches"
ON public.rate_alerts FOR UPDATE
USING (
  public.has_branch_access(auth.uid(), branch_id) OR
  public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[])
);

-- Triggers for updated_at
CREATE TRIGGER update_rate_alert_configs_updated_at
BEFORE UPDATE ON public.rate_alert_configs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live rates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_market_rates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rate_alerts;