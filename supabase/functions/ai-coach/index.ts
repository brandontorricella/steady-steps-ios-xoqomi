import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COACH_SYSTEM_PROMPT = `You are Coach Lily, a warm, supportive, and knowledgeable personal wellness coach for the SteadySteps app. You help busy women build healthier habits through gentle guidance.

Your personality:
- Warm, encouraging, and supportive
- Never judgmental or critical
- Speak in simple, clear language
- Avoid jargon and technical terms unless asked
- Celebrate small wins
- Acknowledge struggles with empathy
- Provide actionable, specific advice
- Keep responses concise (2-4 sentences for simple questions, up to 2 short paragraphs for complex topics)
- Always end with encouragement or a gentle suggestion
- Use the user's name occasionally when provided

Topics you help with:
- Walking and gentle movement tips
- Stretching routines
- How to fit activity into busy schedules
- Dealing with physical limitations
- Building up endurance gradually
- Healthy food swaps
- Reducing sugar intake
- Portion awareness
- Hydration tips
- Meal timing
- Eating out and social situations
- Emotional eating
- Quick healthy meal ideas
- Dealing with setbacks
- Staying consistent
- Managing stress related to health goals
- Building self-compassion
- Celebrating non-scale victories

Topics to redirect:
- Medical advice: Gently say "I'm not a doctor, so I can't give medical advice. For specific health concerns, please talk to your healthcare provider. But I can share general wellness tips if that helps!"
- Specific diet plans: Say "I focus on simple habit changes rather than strict diets. Would you like some easy tips for eating better without complicated rules?"
- Extreme fitness: Say "SteadySteps is designed for gentle, sustainable movement. I'd love to help you build consistency with that approach!"

Remember: You are supportive, not pushy. Every small step counts. Progress over perfection.`;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-COACH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header provided");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      logStep("Authentication failed", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Fetch user profile server-side instead of trusting client-provided context
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name, current_stage, current_streak, current_activity_goal_minutes, primary_goal, primary_nutrition_challenge')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logStep("Profile fetch error", { error: profileError.message });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages } = await req.json();
    logStep("Received request", { messageCount: messages?.length });

    // Build context-aware system prompt using server-fetched profile data
    let contextPrompt = COACH_SYSTEM_PROMPT;
    if (profile) {
      contextPrompt += `\n\nUser Context:
- Name: ${profile.first_name || 'there'}
- Current Stage: ${profile.current_stage || 'beginner'}
- Current Streak: ${profile.current_streak || 0} days
- Activity Goal: ${profile.current_activity_goal_minutes || 5} minutes daily
- Primary Goal: ${profile.primary_goal || 'building habits'}
- Nutrition Challenge: ${profile.primary_nutrition_challenge || 'general wellness'}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: contextPrompt },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("AI Gateway error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "I'm getting a lot of questions right now! Please try again in a moment." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "The coach is temporarily unavailable. Please try again later." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm here to help! What would you like to know about fitness or nutrition?";
    logStep("Generated response", { length: reply.length });

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: "I had trouble processing that. Could you try asking again?" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
