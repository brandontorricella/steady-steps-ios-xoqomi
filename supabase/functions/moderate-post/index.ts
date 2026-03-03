import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ approved: false, reason: "No content provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic content moderation rules
    const blockedPatterns = [
      /\b(kill|suicide|self.?harm|cut myself)\b/i,
      /\b(fuck|shit|damn|bitch|ass)\b/i,
      /\b(http[s]?:\/\/|www\.)\S+/i, // no links
      /\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/, // no phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // no emails
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(content)) {
        return new Response(
          JSON.stringify({
            approved: false,
            reason: "Your message contains content that isn't allowed in our supportive community. Please rephrase and try again.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check length
    if (content.length < 5) {
      return new Response(
        JSON.stringify({ approved: false, reason: "Message is too short. Share a bit more!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (content.length > 500) {
      return new Response(
        JSON.stringify({ approved: false, reason: "Message is too long. Keep it under 500 characters." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ approved: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ approved: false, reason: "Moderation check failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
