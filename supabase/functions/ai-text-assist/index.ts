import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fieldName, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompts: Record<string, string> = {
      "product_name": `Generate 5 professional jewelry product names for a ${context || "jewelry item"}. Return names only, one per line. Examples: "22K Gold Diamond Solitaire Ring", "Elegant Kundan Bridal Necklace"`,
      "product_description": `Generate 5 short professional product descriptions for a ${context || "jewelry item"}. Each description should be 1-2 sentences. Return descriptions only, one per line.`,
      "customer_notes": `Generate 5 professional customer note suggestions for a jewelry business. Context: ${context || "general customer interaction"}. Return notes only, one per line.`,
      "loan_notes": `Generate 5 professional loan note suggestions for a jewelry gold loan. Context: ${context || "standard gold loan"}. Return notes only, one per line.`,
      "order_notes": `Generate 5 professional order note suggestions. Context: ${context || "custom jewelry order"}. Return notes only, one per line.`,
      "repair_notes": `Generate 5 professional repair order note suggestions. Context: ${context || "jewelry repair"}. Return notes only, one per line.`,
      "expense_description": `Generate 5 professional expense descriptions for a jewelry business. Context: ${context || "business expense"}. Return descriptions only, one per line.`,
      "scheme_description": `Generate 5 professional savings scheme descriptions. Context: ${context || "gold savings scheme"}. Return descriptions only, one per line.`,
    };

    const systemPrompt = prompts[fieldName] || 
      `Generate 5 professional suggestions for the "${fieldName}" field. Context: ${context || "jewelry business"}. Return suggestions only, one per line.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a helpful assistant for a jewelry business management system. Generate professional, industry-appropriate suggestions." },
          { role: "user", content: systemPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ suggestions: ["Rate limit exceeded. Please try again later."] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse suggestions from response
    const suggestions = content
      .split("\n")
      .map((line: string) => line.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((line: string) => line.length > 0 && line.length < 200)
      .slice(0, 5);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI text assist error:", error);
    return new Response(
      JSON.stringify({ 
        suggestions: ["Unable to generate suggestions. Please try again."],
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
