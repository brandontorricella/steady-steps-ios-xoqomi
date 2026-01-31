import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const CheckoutSchema = z.object({
  priceId: z.string().optional(),
  isAnnual: z.boolean()
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      logStep("Invalid JSON body");
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const parseResult = CheckoutSchema.safeParse(body);
    if (!parseResult.success) {
      logStep("Validation failed", { errors: parseResult.error.flatten() });
      return new Response(JSON.stringify({ error: "Invalid request parameters" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { priceId, isAnnual } = parseResult.data;
    logStep("Received request", { priceId, isAnnual });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    let userEmail: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user?.email) {
        userEmail = data.user.email;
        logStep("Authenticated user", { email: userEmail });
      }
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Skip customer lookup - let Stripe handle it via customer_email
    // This avoids needing customer:read permission on restricted keys
    logStep("Proceeding without customer lookup");

    // Create a checkout session with 7-day trial
    // After trial, Stripe automatically charges the payment method
    const origin = req.headers.get("origin") || "https://steadysteps.app";
    
    const successUrl = `${origin}/profile-setup?payment=success`;
    const cancelUrl = `${origin}/profile-setup?payment=cancel`;
    
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer_email: userEmail || undefined,
      payment_method_types: ['card'],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_collection: 'always',
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        // After trial ends, Stripe automatically charges the saved payment method
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isAnnual ? 'SteadySteps Annual' : 'SteadySteps Monthly',
              description: isAnnual 
                ? 'Your personal AI fitness and nutrition coach - Annual subscription (billed yearly)'
                : 'Your personal AI fitness and nutrition coach - Monthly subscription (billed on the 1st of each month)',
            },
            unit_amount: isAnnual ? 4188 : 499, // Annual is 30% off ($4.99 * 12 * 0.7 = $41.88)
            recurring: {
              interval: isAnnual ? 'year' : 'month',
              // For monthly, Stripe handles billing on the subscription anniversary date
            },
          },
          quantity: 1,
        },
      ],
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Created checkout session", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: "Unable to create checkout session. Please try again or contact support." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
