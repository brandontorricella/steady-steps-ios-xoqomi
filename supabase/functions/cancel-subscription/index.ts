import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Try to find the customer - handle restricted API key gracefully
    let customerId: string | null = null;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found Stripe customer", { customerId });
      }
    } catch (stripeError: any) {
      // If Stripe key doesn't have customer read permissions, provide helpful message
      logStep("Stripe customer lookup failed (restricted key)", { error: stripeError.message });
      
      // Still update the local profile to cancelled status
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'cancelled',
          subscription_end_date: new Date().toISOString(),
        })
        .eq('id', user.id);
      logStep("Updated profile subscription status (without Stripe cancellation)");
      
      return new Response(JSON.stringify({ 
        success: true,
        message: "Subscription marked as cancelled. If you have an active Stripe subscription, please contact support or use the customer portal to cancel it.",
        needsPortal: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!customerId) {
      // No customer found - update local status and return success
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'cancelled',
          subscription_end_date: new Date().toISOString(),
        })
        .eq('id', user.id);
      logStep("Updated profile subscription status (no Stripe customer)");
      
      return new Response(JSON.stringify({ 
        success: true,
        message: "No active subscription found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Cancel all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    for (const sub of subscriptions.data) {
      await stripe.subscriptions.cancel(sub.id);
      logStep("Cancelled subscription", { subscriptionId: sub.id });
    }

    // Delete all payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    for (const pm of paymentMethods.data) {
      await stripe.paymentMethods.detach(pm.id);
      logStep("Detached payment method", { paymentMethodId: pm.id });
    }

    // Update the user's profile to cancelled status
    await supabaseClient
      .from('profiles')
      .update({ 
        subscription_status: 'cancelled',
        subscription_end_date: new Date().toISOString(),
      })
      .eq('id', user.id);
    logStep("Updated profile subscription status");

    return new Response(JSON.stringify({ 
      success: true,
      message: "Subscription cancelled and payment info removed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 to avoid frontend errors
    });
  }
});
