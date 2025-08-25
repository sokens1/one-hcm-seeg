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
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #0f172a;">
    <h2 style="color:#1d4ed8;">Candidature bien reçue</h2>
    <p>Bonjour ${firstName || ""},</p>
    <p>Nous confirmons la réception de votre candidature pour le poste <strong>${jobTitle}</strong>.</p>
    <p>Notre équipe va étudier votre dossier et reviendra vers vous prochainement.</p>
    <p style="margin-top:16px">Cordialement,<br/>SEEG – Recrutement</p>
  </div>
`;

const textTemplate = (firstName: string, jobTitle: string) => `
Bonjour ${firstName || ""},

Nous confirmons la réception de votre candidature pour le poste "${jobTitle}".
Notre équipe va étudier votre dossier et reviendra vers vous prochainement.

Cordialement,
SEEG – Recrutement
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
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "SEEG Recrutement <no-reply@example.com>";

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
