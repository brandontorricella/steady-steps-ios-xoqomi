import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-INCOMPLETE-SIGNUP] ${step}${detailsStr}`);
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
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Delete profile data first (due to foreign key constraints)
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      logStep("Error deleting profile", { error: profileError });
    } else {
      logStep("Profile deleted successfully");
    }

    // Delete related data
    await supabaseClient.from('daily_checkins').delete().eq('user_id', user.id);
    await supabaseClient.from('coach_conversations').delete().eq('user_id', user.id);
    await supabaseClient.from('user_badges').delete().eq('user_id', user.id);
    await supabaseClient.from('buddy_connections').delete().eq('user_id', user.id);
    await supabaseClient.from('buddy_connections').delete().eq('buddy_id', user.id);
    await supabaseClient.from('referrals').delete().eq('referrer_id', user.id);
    
    logStep("Related data deleted");

    // Delete the auth user - this completely removes the email from the system
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      logStep("Error deleting auth user", { error: deleteError });
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    logStep("Auth user deleted successfully - email can be reused");

    return new Response(JSON.stringify({ success: true }), {
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
