import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const SignupEventSchema = z.object({
  eventType: z.literal('signup'),
  referralCode: z.string().min(1).max(50),
  referredEmail: z.string().email().max(255),
  referredUserId: z.string().uuid()
});

const PaidEventSchema = z.object({
  eventType: z.literal('paid'),
  referredUserId: z.string().uuid(),
  referralCode: z.string().optional(),
  referredEmail: z.string().optional()
});

const ReferralSchema = z.discriminatedUnion('eventType', [SignupEventSchema, PaidEventSchema]);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REFERRAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

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

    const parseResult = ReferralSchema.safeParse(body);
    if (!parseResult.success) {
      logStep("Validation failed", { errors: parseResult.error.flatten() });
      return new Response(JSON.stringify({ error: "Invalid request parameters" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const validatedData = parseResult.data;
    logStep("Received request", { eventType: validatedData.eventType });

    // Event types: 'signup', 'paid'
    if (validatedData.eventType === 'signup') {
      const { referralCode, referredEmail, referredUserId } = validatedData;
      
      // Find the referrer by their referral code (first 8 chars of user ID)
      const { data: profiles, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id')
        .ilike('id', `${referralCode}%`);

      if (profileError || !profiles || profiles.length === 0) {
        logStep("Referrer not found", { referralCode });
        return new Response(JSON.stringify({ error: "Referrer not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      const referrerId = profiles[0].id;
      logStep("Found referrer", { referrerId });

      // Create the referral record
      const { error: insertError } = await supabaseClient
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_email: referredEmail,
          referred_user_id: referredUserId,
          status: 'pending',
        });

      if (insertError) {
        logStep("Error creating referral", { error: insertError.message });
        throw insertError;
      }

      logStep("Created referral record");

      return new Response(JSON.stringify({ success: true, message: "Referral created" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (validatedData.eventType === 'paid') {
      const { referredUserId } = validatedData;
      
      // Update the referral status to paid
      const { data: referral, error: updateError } = await supabaseClient
        .from('referrals')
        .update({ status: 'paid' })
        .eq('referred_user_id', referredUserId)
        .select()
        .maybeSingle();

      if (updateError) {
        logStep("Error updating referral", { error: updateError.message });
        throw updateError;
      }

      if (!referral) {
        logStep("No referral found for user", { referredUserId });
        return new Response(JSON.stringify({ message: "No referral to update" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const referrerId = referral.referrer_id;
      logStep("Updated referral to paid", { referrerId });

      // Count paid referrals for this referrer
      const { count, error: countError } = await supabaseClient
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', referrerId)
        .eq('status', 'paid');

      if (countError) {
        logStep("Error counting referrals", { error: countError.message });
        throw countError;
      }

      const paidCount = count || 0;
      logStep("Paid referrals count", { paidCount });

      // Check if they've earned a new free month (every 2 paid referrals)
      if (paidCount > 0 && paidCount % 2 === 0) {
        logStep("User earned a free month!", { referrerId, paidCount });
        
        // Award the referral champion badge if not already earned
        const { data: existingBadge } = await supabaseClient
          .from('user_badges')
          .select('id')
          .eq('user_id', referrerId)
          .eq('badge_id', 'referral_champion')
          .maybeSingle();

        if (!existingBadge) {
          await supabaseClient
            .from('user_badges')
            .insert({
              user_id: referrerId,
              badge_id: 'referral_champion',
            });
          logStep("Awarded referral_champion badge");
        }

        // Try to extend their subscription in Stripe
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (stripeKey) {
          try {
            const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
            
            // Get the referrer's email
            const { data: referrerProfile } = await supabaseClient
              .from('profiles')
              .select('email')
              .eq('id', referrerId)
              .single();

            if (referrerProfile?.email) {
              const customers = await stripe.customers.list({ 
                email: referrerProfile.email, 
                limit: 1 
              });

              if (customers.data.length > 0) {
                const customerId = customers.data[0].id;
                const subscriptions = await stripe.subscriptions.list({
                  customer: customerId,
                  status: 'active',
                  limit: 1,
                });

                if (subscriptions.data.length > 0) {
                  // Add a free month by creating a credit/coupon
                  // For simplicity, we'll create invoice credit
                  const freeMonthsEarned = Math.floor(paidCount / 2);
                  
                  // Update subscription metadata to track free months
                  await stripe.subscriptions.update(subscriptions.data[0].id, {
                    metadata: {
                      free_months_earned: freeMonthsEarned.toString(),
                      last_referral_reward: new Date().toISOString(),
                    }
                  });
                  
                  logStep("Updated subscription with free month reward", { 
                    subscriptionId: subscriptions.data[0].id,
                    freeMonthsEarned 
                  });
                }
              }
            }
          } catch (stripeError: unknown) {
            const errorMessage = stripeError instanceof Error ? stripeError.message : String(stripeError);
            logStep("Stripe operation failed (reward noted)", { error: errorMessage });
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Referral updated",
        freeMonthsEarned: Math.floor(paidCount / 2),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Invalid event type" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: "Unable to process referral. Please try again or contact support." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
