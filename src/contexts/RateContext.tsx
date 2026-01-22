import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "./BranchContext";

interface DailyRates {
  id: string;
  branch_id: string;
  rate_date: string;
  gold_24k_buy: number;
  gold_24k_sell: number;
  gold_22k_buy: number | null;
  gold_22k_sell: number | null;
  gold_18k_buy: number | null;
  gold_18k_sell: number | null;
  gold_14k_buy: number | null;
  gold_14k_sell: number | null;
  silver_999_buy: number | null;
  silver_999_sell: number | null;
  silver_925_buy: number | null;
  silver_925_sell: number | null;
  platinum_buy: number | null;
  platinum_sell: number | null;
  wholesale_discount_percent: number;
  updated_at: string;
}

interface RateContextType {
  rates: DailyRates | null;
  isLoading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  getGoldRate: (purity: "24K" | "22K" | "18K" | "14K", type: "buy" | "sell") => number;
  getSilverRate: (purity: "999" | "925", type: "buy" | "sell") => number;
}

const RateContext = createContext<RateContextType | undefined>(undefined);

export function RateProvider({ children }: { children: React.ReactNode }) {
  const { currentBranch } = useBranch();
  const [rates, setRates] = useState<DailyRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    if (!currentBranch) {
      setRates(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const today = new Date().toISOString().split("T")[0];

      const { data, error: fetchError } = await supabase
        .from("daily_rates")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .eq("rate_date", today)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          // No rates for today
          setRates(null);
          setError("No rates set for today");
        } else {
          throw fetchError;
        }
      } else {
        setRates(data as DailyRates);
      }
    } catch (err) {
      console.error("Error fetching rates:", err);
      setError("Failed to fetch rates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [currentBranch]);

  const getGoldRate = (
    purity: "24K" | "22K" | "18K" | "14K",
    type: "buy" | "sell"
  ): number => {
    if (!rates) return 0;

    const key = `gold_${purity.toLowerCase()}_${type}` as keyof DailyRates;
    return (rates[key] as number) || 0;
  };

  const getSilverRate = (
    purity: "999" | "925",
    type: "buy" | "sell"
  ): number => {
    if (!rates) return 0;

    const key = `silver_${purity}_${type}` as keyof DailyRates;
    return (rates[key] as number) || 0;
  };

  return (
    <RateContext.Provider
      value={{
        rates,
        isLoading,
        error,
        refreshRates: fetchRates,
        getGoldRate,
        getSilverRate,
      }}
    >
      {children}
    </RateContext.Provider>
  );
}

export function useRates() {
  const context = useContext(RateContext);
  if (context === undefined) {
    throw new Error("useRates must be used within a RateProvider");
  }
  return context;
}
