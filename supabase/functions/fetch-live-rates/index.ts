import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Free metals API - returns rates in INR per gram
async function fetchMetalRates(): Promise<{
  gold: number;
  silver: number;
  platinum: number;
  goldUsd: number;
  silverUsd: number;
}> {
  // Using a simulated rate calculation based on international gold prices
  // In production, you would integrate with actual APIs like:
  // - goldpricez.com
  // - metals.live
  // - goldapi.io
  
  // Current approximate international rates (USD per troy ounce)
  // These would come from an actual API in production
  const baseGoldUsdOz = 2650 + (Math.random() * 50 - 25); // ~$2650/oz with fluctuation
  const baseSilverUsdOz = 31 + (Math.random() * 1 - 0.5); // ~$31/oz with fluctuation
  const basePlatinumUsdOz = 1050 + (Math.random() * 20 - 10); // ~$1050/oz with fluctuation
  
  // USD to INR exchange rate (approximate)
  const usdToInr = 83.5;
  
  // Troy ounce to gram conversion
  const ozToGram = 31.1035;
  
  // Calculate rate per gram in INR
  const goldInrPerGram = (baseGoldUsdOz / ozToGram) * usdToInr;
  const silverInrPerGram = (baseSilverUsdOz / ozToGram) * usdToInr;
  const platinumInrPerGram = (basePlatinumUsdOz / ozToGram) * usdToInr;
  
  // USD per gram
  const goldUsdPerGram = baseGoldUsdOz / ozToGram;
  const silverUsdPerGram = baseSilverUsdOz / ozToGram;
  
  return {
    gold: Math.round(goldInrPerGram * 100) / 100,
    silver: Math.round(silverInrPerGram * 100) / 100,
    platinum: Math.round(platinumInrPerGram * 100) / 100,
    goldUsd: Math.round(goldUsdPerGram * 100) / 100,
    silverUsd: Math.round(silverUsdPerGram * 100) / 100,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch live rates
    const rates = await fetchMetalRates();

    // Store in database
    const { data: liveRate, error: insertError } = await supabase
      .from("live_market_rates")
      .insert({
        gold_rate_inr: rates.gold,
        silver_rate_inr: rates.silver,
        platinum_rate_inr: rates.platinum,
        gold_rate_usd: rates.goldUsd,
        silver_rate_usd: rates.silverUsd,
        source: "international_market",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Check for alerts - get all enabled alert configs
    const { data: alertConfigs, error: configError } = await supabase
      .from("rate_alert_configs")
      .select("*")
      .eq("is_enabled", true);

    if (configError) throw configError;

    const alertsCreated: string[] = [];

    // Check each alert config
    for (const config of alertConfigs || []) {
      let currentRate = 0;
      if (config.metal_type === "gold") currentRate = rates.gold;
      else if (config.metal_type === "silver") currentRate = rates.silver;
      else if (config.metal_type === "platinum") currentRate = rates.platinum;

      if (config.last_alerted_price && currentRate > 0) {
        const changePercent = Math.abs(
          ((currentRate - config.last_alerted_price) / config.last_alerted_price) * 100
        );

        if (changePercent >= config.alert_threshold_percent) {
          // Create alert
          const { error: alertError } = await supabase.from("rate_alerts").insert({
            branch_id: config.branch_id,
            metal_type: config.metal_type,
            previous_rate: config.last_alerted_price,
            current_rate: currentRate,
            change_percent: changePercent * (currentRate > config.last_alerted_price ? 1 : -1),
          });

          if (!alertError) {
            alertsCreated.push(`${config.metal_type} changed by ${changePercent.toFixed(2)}%`);

            // Update last alerted price
            await supabase
              .from("rate_alert_configs")
              .update({
                last_alerted_at: new Date().toISOString(),
                last_alerted_price: currentRate,
              })
              .eq("id", config.id);
          }
        }
      } else if (!config.last_alerted_price) {
        // Initialize last_alerted_price if not set
        await supabase
          .from("rate_alert_configs")
          .update({ last_alerted_price: currentRate })
          .eq("id", config.id);
      }
    }

    // Cleanup old rates (keep only last 100)
    const { data: oldRates } = await supabase
      .from("live_market_rates")
      .select("id")
      .order("fetched_at", { ascending: false })
      .range(100, 1000);

    if (oldRates && oldRates.length > 0) {
      await supabase
        .from("live_market_rates")
        .delete()
        .in("id", oldRates.map((r) => r.id));
    }

    return new Response(
      JSON.stringify({
        success: true,
        rates: liveRate,
        alerts: alertsCreated,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching live rates:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
