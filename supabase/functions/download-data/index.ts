import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DOWNLOAD-DATA] ${step}${detailsStr}`);
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
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const userId = user.id;

    // Fetch all user data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    logStep("Fetched profile");

    const { data: checkins } = await supabaseClient
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    logStep("Fetched checkins", { count: checkins?.length || 0 });

    const { data: badges } = await supabaseClient
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);
    logStep("Fetched badges", { count: badges?.length || 0 });

    const { data: conversations } = await supabaseClient
      .from('coach_conversations')
      .select('*')
      .eq('user_id', userId);
    logStep("Fetched conversations", { count: conversations?.length || 0 });

    const { data: buddyConnections } = await supabaseClient
      .from('buddy_connections')
      .select('*')
      .or(`user_id.eq.${userId},buddy_id.eq.${userId}`);
    logStep("Fetched buddy connections", { count: buddyConnections?.length || 0 });

    const { data: referrals } = await supabaseClient
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);
    logStep("Fetched referrals", { count: referrals?.length || 0 });

    // Compile all data
    const userData2 = {
      exportDate: new Date().toISOString(),
      profile: profile || null,
      dailyCheckins: checkins || [],
      earnedBadges: badges || [],
      coachConversations: conversations || [],
      buddyConnections: buddyConnections || [],
      referrals: referrals || [],
    };

    logStep("Data compiled successfully");

    return new Response(JSON.stringify(userData2, null, 2), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="steadysteps-data-${new Date().toISOString().split('T')[0]}.json"`,
      },
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
