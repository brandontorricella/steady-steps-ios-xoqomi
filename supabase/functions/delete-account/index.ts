import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id || !user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Step 1: Try to cancel Stripe subscription
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          logStep("Found Stripe customer", { customerId });
          
          // Cancel all active subscriptions
          const subscriptions = await stripe.subscriptions.list({ 
            customer: customerId, 
            status: 'active' 
          });
          
          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
            logStep("Cancelled subscription", { subscriptionId: sub.id });
          }

          // Delete the customer from Stripe
          await stripe.customers.del(customerId);
          logStep("Deleted Stripe customer");
        }
      } catch (stripeError: any) {
        logStep("Stripe operation failed (continuing with deletion)", { error: stripeError.message });
      }
    }

    // Step 2: Delete all user data from database tables
    const userId = user.id;

    // Delete daily check-ins
    const { error: checkinsError } = await supabaseClient
      .from('daily_checkins')
      .delete()
      .eq('user_id', userId);
    if (checkinsError) logStep("Error deleting checkins", { error: checkinsError.message });
    else logStep("Deleted daily check-ins");

    // Delete user badges
    const { error: badgesError } = await supabaseClient
      .from('user_badges')
      .delete()
      .eq('user_id', userId);
    if (badgesError) logStep("Error deleting badges", { error: badgesError.message });
    else logStep("Deleted user badges");

    // Delete coach conversations
    const { error: coachError } = await supabaseClient
      .from('coach_conversations')
      .delete()
      .eq('user_id', userId);
    if (coachError) logStep("Error deleting coach conversations", { error: coachError.message });
    else logStep("Deleted coach conversations");

    // Delete buddy connections (both as user and buddy)
    const { error: buddyError1 } = await supabaseClient
      .from('buddy_connections')
      .delete()
      .eq('user_id', userId);
    const { error: buddyError2 } = await supabaseClient
      .from('buddy_connections')
      .delete()
      .eq('buddy_id', userId);
    if (!buddyError1 && !buddyError2) logStep("Deleted buddy connections");

    // Delete referrals (as referrer)
    const { error: referralsError } = await supabaseClient
      .from('referrals')
      .delete()
      .eq('referrer_id', userId);
    if (referralsError) logStep("Error deleting referrals", { error: referralsError.message });
    else logStep("Deleted referrals");

    // Update referrals where this user was referred (set referred_user_id to null)
    const { error: referredError } = await supabaseClient
      .from('referrals')
      .update({ referred_user_id: null })
      .eq('referred_user_id', userId);
    if (!referredError) logStep("Cleared referred_user_id from referrals");

    // Delete user profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileError) logStep("Error deleting profile", { error: profileError.message });
    else logStep("Deleted user profile");

    // Step 3: Delete the auth user (this removes the email from auth.users)
    const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      logStep("Error deleting auth user", { error: deleteUserError.message });
      throw new Error(`Failed to delete auth user: ${deleteUserError.message}`);
    }
    logStep("Deleted auth user - email is now available for new signups");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Account and all data deleted successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
