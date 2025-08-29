/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: send_application_confirmation
// Sends a confirmation email to candidate after application submission using Resend API

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Minimal Deno type shim for IDEs running Node/TS (runtime provides the real global)
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: { get: (key: string) => string | undefined };
};

interface Payload {
  to: string;
  firstName: string;
  jobTitle: string;
  applicationId?: string;
}

const htmlTemplate = (firstName: string, jobTitle: string) => `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
      <h1 style="color: white; margin: 0; text-align: center; font-size: 24px;">SEEG - Confirmation de candidature</h1>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #1d4ed8;">
      <h2 style="color:#1d4ed8; margin-top: 0;">Candidature bien reçue</h2>
      <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${firstName || ""}</strong>,</p>
      <p style="font-size: 16px; margin-bottom: 20px;">Nous confirmons la réception de votre candidature pour le poste <strong>${jobTitle}</strong>.</p>
      <p style="font-size: 16px; margin-bottom: 20px;">Notre équipe va étudier votre dossier avec attention et reviendra vers vous dans les plus brefs délais.</p>
      
      <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
          <strong>📧 Contact :</strong> support@seeg-talentsource.com<br>
          <strong>📞 Support :</strong> +241 076402886
        </p>
      </div>
      
      <p style="margin-top: 20px; font-size: 16px;">Cordialement,<br/><strong>SEEG – Équipe Recrutement</strong></p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f1f5f9; border-radius: 8px;">
      <p style="margin: 0; font-size: 12px; color: #64748b;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
      </p>
    </div>
  </div>
`;

const textTemplate = (firstName: string, jobTitle: string) => `
Bonjour ${firstName || ""},

Nous confirmons la réception de votre candidature pour le poste "${jobTitle}".
Notre équipe va étudier votre dossier avec attention et reviendra vers vous dans les plus brefs délais.

📧 Contact : support@seeg-talentsource.com
📞 Support : +241 076402886

Cordialement,
SEEG – Équipe Recrutement

---
Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the request body
    const payload = await req.json() as Payload;
    const { to, firstName, jobTitle } = payload;

    // Validate required fields
    if (!to || !jobTitle) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: 'to' and 'jobTitle' are required" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get environment variables
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "SEEG Recrutement <support@seeg-talentsource.com>";

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({
        error: "RESEND_API_KEY not configured",
        hint: "Set RESEND_API_KEY via 'supabase secrets set RESEND_API_KEY=...'"
      }), { 
        status: 501, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Prepare email data
    const emailData = {
      from: FROM_EMAIL,
      to: to.trim(),
      subject: `Confirmation de candidature – ${jobTitle.trim()}`,
      html: htmlTemplate(firstName || "", jobTitle.trim()),
      text: textTemplate(firstName || "", jobTitle.trim()),
    };

    // Send email via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const data = await res.json();
    
    if (!res.ok) {
      return new Response(JSON.stringify({ 
        error: "Failed to send email",
        details: data?.message || "Unknown error",
        status: res.status
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      id: data?.id,
      message: "Email sent successfully"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
