import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { RealtimeChannel } from "@supabase/supabase-js";

interface LiveMarketRate {
  id: string;
  gold_rate_inr: number;
  silver_rate_inr: number;
  platinum_rate_inr: number | null;
  gold_rate_usd: number | null;
  silver_rate_usd: number | null;
  fetched_at: string;
  source: string;
}

interface RateAlert {
  id: string;
  branch_id: string;
  metal_type: string;
  previous_rate: number;
  current_rate: number;
  change_percent: number;
  is_read: boolean;
  created_at: string;
}

interface RateAlertConfig {
  id: string;
  branch_id: string;
  metal_type: string;
  alert_threshold_percent: number;
  is_enabled: boolean;
  last_alerted_at: string | null;
  last_alerted_price: number | null;
}

export function useLiveRates() {
  const [liveRates, setLiveRates] = useState<LiveMarketRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestRates = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("live_market_rates")
        .select("*")
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      setLiveRates(data as LiveMarketRate | null);
      setError(null);
    } catch (err) {
      console.error("Error fetching live rates:", err);
      setError("Failed to fetch live rates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshLiveRates = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("fetch-live-rates");
      
      if (error) throw error;
      
      if (data?.rates) {
        setLiveRates(data.rates as LiveMarketRate);
      }
      
      return data;
    } catch (err) {
      console.error("Error refreshing live rates:", err);
      setError("Failed to refresh live rates");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestRates();

    // Subscribe to realtime updates
    let channel: RealtimeChannel | null = null;
    
    const setupRealtime = () => {
      channel = supabase
        .channel("live_market_rates_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "live_market_rates",
          },
          (payload) => {
            setLiveRates(payload.new as LiveMarketRate);
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchLatestRates]);

  return {
    liveRates,
    isLoading,
    error,
    refreshLiveRates,
    fetchLatestRates,
  };
}

export function useRateAlerts() {
  const { currentBranch } = useBranch();
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!currentBranch) return;

    try {
      const { data, error } = await supabase
        .from("rate_alerts")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setAlerts(data as RateAlert[]);
      setUnreadCount(data?.filter((a) => !a.is_read).length || 0);
    } catch (err) {
      console.error("Error fetching rate alerts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch]);

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      await supabase
        .from("rate_alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking alert as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!currentBranch) return;

    try {
      await supabase
        .from("rate_alerts")
        .update({ is_read: true })
        .eq("branch_id", currentBranch.id)
        .eq("is_read", false);

      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all alerts as read:", err);
    }
  }, [currentBranch]);

  useEffect(() => {
    fetchAlerts();

    // Subscribe to new alerts
    let channel: RealtimeChannel | null = null;

    if (currentBranch) {
      channel = supabase
        .channel("rate_alerts_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "rate_alerts",
            filter: `branch_id=eq.${currentBranch.id}`,
          },
          (payload) => {
            setAlerts((prev) => [payload.new as RateAlert, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentBranch, fetchAlerts]);

  return {
    alerts,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchAlerts,
  };
}

export function useRateAlertConfigs() {
  const { currentBranch } = useBranch();
  const [configs, setConfigs] = useState<RateAlertConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    if (!currentBranch) return;

    try {
      const { data, error } = await supabase
        .from("rate_alert_configs")
        .select("*")
        .eq("branch_id", currentBranch.id);

      if (error) throw error;

      setConfigs(data as RateAlertConfig[]);
    } catch (err) {
      console.error("Error fetching alert configs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch]);

  const upsertConfig = useCallback(
    async (metalType: string, thresholdPercent: number, isEnabled: boolean) => {
      if (!currentBranch) return;

      try {
        const existing = configs.find((c) => c.metal_type === metalType);

        if (existing) {
          const { error } = await supabase
            .from("rate_alert_configs")
            .update({
              alert_threshold_percent: thresholdPercent,
              is_enabled: isEnabled,
            })
            .eq("id", existing.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("rate_alert_configs").insert({
            branch_id: currentBranch.id,
            metal_type: metalType,
            alert_threshold_percent: thresholdPercent,
            is_enabled: isEnabled,
          });

          if (error) throw error;
        }

        await fetchConfigs();
      } catch (err) {
        console.error("Error saving alert config:", err);
        throw err;
      }
    },
    [currentBranch, configs, fetchConfigs]
  );

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    isLoading,
    upsertConfig,
    fetchConfigs,
  };
}
