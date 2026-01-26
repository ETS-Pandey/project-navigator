import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";

export interface RateHistoryRecord {
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
  wholesale_discount_percent: number | null;
  created_at: string;
  updated_at: string;
}

interface UseRateHistoryOptions {
  startDate?: Date;
  endDate?: Date;
}

export function useRateHistory(options: UseRateHistoryOptions = {}) {
  const { currentBranch } = useBranch();
  const [rates, setRates] = useState<RateHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRateHistory = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      if (!currentBranch) {
        setRates([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("daily_rates")
          .select("*")
          .eq("branch_id", currentBranch.id)
          .order("rate_date", { ascending: false });

        if (startDate) {
          query = query.gte("rate_date", startDate.toISOString().split("T")[0]);
        }

        if (endDate) {
          query = query.lte("rate_date", endDate.toISOString().split("T")[0]);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setRates(data as RateHistoryRecord[]);
      } catch (err) {
        console.error("Error fetching rate history:", err);
        setError("Failed to fetch rate history");
      } finally {
        setIsLoading(false);
      }
    },
    [currentBranch]
  );

  const exportToCSV = useCallback((data: RateHistoryRecord[]) => {
    const headers = [
      "Date",
      "Gold 24K Buy",
      "Gold 24K Sell",
      "Gold 22K Buy",
      "Gold 22K Sell",
      "Gold 18K Buy",
      "Gold 18K Sell",
      "Gold 14K Buy",
      "Gold 14K Sell",
      "Silver 999 Buy",
      "Silver 999 Sell",
      "Silver 925 Buy",
      "Silver 925 Sell",
      "Platinum Buy",
      "Platinum Sell",
      "Wholesale Discount %",
    ];

    const rows = data.map((rate) => [
      rate.rate_date,
      rate.gold_24k_buy,
      rate.gold_24k_sell,
      rate.gold_22k_buy ?? "",
      rate.gold_22k_sell ?? "",
      rate.gold_18k_buy ?? "",
      rate.gold_18k_sell ?? "",
      rate.gold_14k_buy ?? "",
      rate.gold_14k_sell ?? "",
      rate.silver_999_buy ?? "",
      rate.silver_999_sell ?? "",
      rate.silver_925_buy ?? "",
      rate.silver_925_sell ?? "",
      rate.platinum_buy ?? "",
      rate.platinum_sell ?? "",
      rate.wholesale_discount_percent ?? "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `rate-history-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    rates,
    isLoading,
    error,
    fetchRateHistory,
    exportToCSV,
  };
}
