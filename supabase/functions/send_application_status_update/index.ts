/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: send_application_status_update
// Sends a status update email to candidate using Resend API

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: { get: (key: string) => string | undefined };
};

type Status = 'refuse' | 'incubation' | 'embauche' | 'entretien_programme';

interface Payload {
  to: string;
  firstName?: string;
  jobTitle: string;
  status: Status;
  interviewDateTime?: string; // ISO when entretien_programme
}

const subjects: Record<Status, (job: string) => string> = {
  refuse: (job) => `Votre candidature – Merci pour votre intérêt (${job})`,
  incubation: (job) => `Votre candidature – Étape d'incubation (${job})`,
  embauche: (job) => `Félicitations – Proposition d'embauche (${job})`,
  entretien_programme: (job) => `Votre entretien est programmé – ${job}`,
};

const htmlBody = (p: Payload) => {
  const header = `<h1 style=\"color: white; margin: 0; text-align: center; font-size: 22px;\">SEEG – Information candidature</h1>`;
  const hello = `<p style=\"font-size:16px;margin:0 0 12px\">Bonjour <strong>${p.firstName || ''}</strong>,</p>`;
  let content = '';
  if (p.status === 'refuse') {
    content = `
      <p style=\"font-size:16px;margin:0 0 12px\">Merci pour l'intérêt porté à la SEEG et la qualité de votre candidature.</p>
      <p style=\"font-size:16px;margin:0 0 12px\">Après examen, votre candidature pour le poste <strong>${p.jobTitle}</strong> n'a pas été retenue pour cette étape.</p>
      <p style=\"font-size:16px;margin:0 0 12px\">Nous vous encourageons à rester attentif aux prochaines opportunités et à postuler de nouveau.</p>
    `;
  } else if (p.status === 'incubation') {
    content = `
      <p style=\"font-size:16px;margin:0 0 12px\">Félicitations pour votre parcours jusqu'ici !</p>
      <p style=\"font-size:16px;margin:0 0 12px\">Votre candidature pour <strong>${p.jobTitle}</strong> entre en phase d'incubation. Notre équipe vous recontactera pour la suite.</p>
    `;
  } else if (p.status === 'embauche') {
    content = `
      <p style=\"font-size:16px;margin:0 0 12px\">Félicitations !</p>
      <p style=\"font-size:16px;margin:0 0 12px\">Votre candidature pour <strong>${p.jobTitle}</strong> a abouti à une proposition d'embauche. Notre équipe vous contactera très prochainement pour finaliser les étapes.</p>
    `;
  } else {
    const dt = p.interviewDateTime ? new Date(p.interviewDateTime) : null;
    const dateTxt = dt ? dt.toLocaleDateString('fr-FR') : '';
    content = `
      <p style=\"font-size:16px;margin:0 0 12px\">Félicitations vous avez un entretien programmé pour le ${dateTxt} suite à votre candidature pour le poste de <strong>${p.jobTitle}</strong>.</p>
    `;
  }
  const contact = `
    <div style=\"background:#e0f2fe;padding:14px;border-radius:8px;margin:16px 0\"> 
      <p style=\"margin:0;font-size:14px;color:#0c4a6e\"><strong>📧 Contact :</strong> support@seeg-talentsource.com · <strong>📞</strong> +241 076402886</p>
    </div>`;
  const sign = `<p style=\"font-size:16px;margin-top:16px\">Cordialement,<br/><strong>SEEG – Équipe Recrutement</strong></p>`;
  return `
  <div style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5; color:#0f172a; max-width:600px; margin:0 auto; padding:20px;\">
    <div style=\"background:linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%); padding:24px; border-radius:10px; margin-bottom:16px;\">${header}</div>
    <div style=\"background:#f8fafc; padding:24px; border-radius:10px; border-left:4px solid #1d4ed8;\">${hello}${content}${contact}${sign}</div>
    <div style=\"text-align:center;margin-top:12px;padding:12px;background:#f1f5f9;border-radius:8px;\">
      <p style=\"margin:0;font-size:12px;color:#64748b\">Cet email est automatique. Merci de ne pas y répondre.</p>
    </div>
  </div>`;
};

const textBody = (p: Payload) => {
  let lines: string[] = [];
  lines.push(`Bonjour ${p.firstName || ''},`);
  if (p.status === 'refuse') {
    lines.push(`Merci pour votre intérêt pour la SEEG.`);
    lines.push(`Après examen, votre candidature pour "${p.jobTitle}" n'a pas été retenue pour cette étape.`);
  } else if (p.status === 'incubation') {
    lines.push(`Félicitations ! Votre candidature pour "${p.jobTitle}" entre en phase d'incubation.`);
  } else if (p.status === 'embauche') {
    lines.push(`Félicitations ! Votre candidature pour "${p.jobTitle}" a abouti à une proposition d'embauche.`);
  } else {
    const dt = p.interviewDateTime ? new Date(p.interviewDateTime).toLocaleDateString('fr-FR') : '';
    const datePart = dt ? ` le ${dt}` : '';
    lines.push(`Félicitations, vous avez un entretien programmé pour${datePart} suite à votre candidature pour le poste de "${p.jobTitle}".`);
  }
  lines.push('');
  lines.push('Contact: support@seeg-talentsource.com · +241 076402886');
  lines.push('');
  lines.push('Cordialement,');
  lines.push('SEEG – Équipe Recrutement');
  lines.push('---');
  lines.push('Email automatique, ne pas répondre.');
  return lines.join('\n');
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  try {
    const payload = await req.json() as Payload;
    const { to, jobTitle, status } = payload;
    if (!to || !jobTitle || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields: 'to', 'jobTitle', 'status'" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'SEEG Recrutement <support@seeg-talentsource.com>';
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const emailData = {
      from: FROM_EMAIL,
      to: to.trim(),
      subject: subjects[status](jobTitle.trim()),
      html: htmlBody(payload),
      text: textBody(payload),
    };
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to send email', details: data?.message || 'Unknown', status: res.status }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ ok: true, id: data?.id }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal server error', message: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});



