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
          <strong>📧 Contact :</strong> recrutement@seeg.ga<br>
          <strong>📞 Support :</strong> +241 11 73 90 22
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
    const payload = (await req.json()) as Payload;
    const { to, firstName, jobTitle } = payload || {} as any;

    if (!to || !jobTitle) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'jobTitle'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "SEEG Recrutement <support@seeg-talentsource.com>";
    
    // Configuration spécifique pour SEEG
    const SUPPORT_EMAIL = "support@seeg-talentsource.com";
    const SUPPORT_PHONE = "+241 076402886";

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({
        error: "RESEND_API_KEY not set. Configure via 'supabase secrets set RESEND_API_KEY=...'.",
      }), { 
        status: 501, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject: `Confirmation de candidature – ${jobTitle}`,
        html: htmlTemplate(firstName, jobTitle),
        text: textTemplate(firstName, jobTitle),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.message || "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
