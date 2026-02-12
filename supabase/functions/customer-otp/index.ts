import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { phone, otp, action } = await req.json();

    if (action === "request") {
      // Find customer by phone
      const { data: customer, error: custError } = await supabase
        .from("customers")
        .select("id, name, phone, email, customer_code")
        .eq("phone", phone)
        .eq("is_active", true)
        .single();

      if (custError || !customer) {
        return new Response(
          JSON.stringify({ success: false, error: "Phone number not registered. Please contact the store." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

      // Store OTP
      await supabase.from("customer_otp_tokens").insert({
        phone,
        otp_code: otpCode,
        customer_id: customer.id,
        expires_at: expiresAt,
      });

      // In production, send SMS via Twilio/MSG91 etc.
      // For now, we log it (visible in edge function logs)
      console.log(`OTP for ${phone}: ${otpCode}`);

      return new Response(
        JSON.stringify({ success: true, message: "OTP sent successfully", _dev_otp: otpCode }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      // Verify OTP
      const { data: tokenData, error: tokenError } = await supabase
        .from("customer_otp_tokens")
        .select("*, customer:customers(id, name, phone, email, customer_code, loyalty_points, outstanding_balance)")
        .eq("phone", phone)
        .eq("otp_code", otp)
        .eq("verified", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid or expired OTP" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Mark OTP as verified
      await supabase
        .from("customer_otp_tokens")
        .update({ verified: true })
        .eq("id", tokenData.id);

      // Create session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      await supabase.from("customer_sessions").insert({
        customer_id: tokenData.customer_id,
        session_token: sessionToken,
        expires_at: expiresAt,
      });

      return new Response(
        JSON.stringify({
          success: true,
          customer: tokenData.customer,
          sessionToken,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    console.error("OTP Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
