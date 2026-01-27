import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PAYMENT-CONFIRMATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      logStep("RESEND_API_KEY not set, skipping email");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const resend = new Resend(resendKey);

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
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    // Get user's first name from profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('first_name, language')
      .eq('id', user.id)
      .maybeSingle();

    const firstName = profile?.first_name || 'there';
    const isSpanish = profile?.language === 'es';
    
    // Calculate trial end date (7 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const formattedDate = trialEndDate.toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const subject = isSpanish 
      ? '¡Bienvenida a SteadySteps! Tu prueba gratuita ha comenzado' 
      : 'Welcome to SteadySteps! Your free trial has started';

    const html = isSpanish ? `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4A7C59; margin-bottom: 24px;">¡Hola ${firstName}! 🎉</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          ¡Gracias por unirte a SteadySteps! Tu prueba gratuita de 7 días ha comenzado.
        </p>
        
        <div style="background: linear-gradient(135deg, #4A7C59 0%, #7CB342 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
          <h2 style="margin: 0 0 12px 0;">Tu Prueba Gratuita</h2>
          <p style="margin: 0; font-size: 14px;">Tu primer cobro será el:</p>
          <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold;">${formattedDate}</p>
        </div>
        
        <h3 style="color: #4A7C59;">Lo que incluye tu suscripción:</h3>
        <ul style="line-height: 1.8; color: #555;">
          <li>Coach de IA personalizado 24/7</li>
          <li>Seguimiento diario de hábitos</li>
          <li>Recordatorios motivacionales</li>
          <li>Seguimiento de progreso</li>
        </ul>
        
        <p style="font-size: 14px; color: #777; margin-top: 24px;">
          Si tienes alguna pregunta, responde a este correo. ¡Estamos aquí para ayudarte!
        </p>
        
        <p style="font-size: 14px; color: #777;">
          Con cariño,<br/>
          El equipo de SteadySteps
        </p>
      </div>
    ` : `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4A7C59; margin-bottom: 24px;">Hi ${firstName}! 🎉</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for joining SteadySteps! Your 7-day free trial has started.
        </p>
        
        <div style="background: linear-gradient(135deg, #4A7C59 0%, #7CB342 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
          <h2 style="margin: 0 0 12px 0;">Your Free Trial</h2>
          <p style="margin: 0; font-size: 14px;">Your first charge will be on:</p>
          <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: bold;">${formattedDate}</p>
        </div>
        
        <h3 style="color: #4A7C59;">What's included in your subscription:</h3>
        <ul style="line-height: 1.8; color: #555;">
          <li>24/7 AI-powered personal coach</li>
          <li>Daily habit tracking</li>
          <li>Motivational reminders</li>
          <li>Progress tracking</li>
        </ul>
        
        <p style="font-size: 14px; color: #777; margin-top: 24px;">
          If you have any questions, just reply to this email. We're here to help!
        </p>
        
        <p style="font-size: 14px; color: #777;">
          With love,<br/>
          The SteadySteps Team
        </p>
      </div>
    `;

    // Send email using Resend
    const { error: emailError } = await resend.emails.send({
      from: "SteadySteps <onboarding@resend.dev>",
      to: [user.email],
      subject,
      html,
    });

    if (emailError) {
      logStep("Email send error", { error: emailError });
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    logStep("Payment confirmation email sent successfully");

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
