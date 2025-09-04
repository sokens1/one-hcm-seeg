import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

function buildInterviewEmailHtml(params: {
  candidateFullName: string;
  jobTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
}) {
  const { candidateFullName, jobTitle, date, time, location } = params;
  const dateObj = new Date(`${date}T${time.length === 5 ? time : time.slice(0,5)}`);
  const formattedDate = dateObj.toLocaleDateString('fr-FR');
  const formattedTime = (time || '').slice(0,5);

  const serif = `, Georgia, 'Times New Roman', serif`;

  return `
  <div style="font-family: ui-serif${serif}; color:#000; max-width:760px; margin:0 auto;">
    <p>Madame/Monsieur ${candidateFullName},</p>
    <p>Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> a retenu notre attention.</p>
    <p>Nous vous invitons à un entretien de recrutement qui se tiendra&nbsp;:</p>
    <p><strong>Date :</strong> ${formattedDate}<br/>
    <strong>Heure :</strong> ${formattedTime}<br/>
    <strong>Lieu :</strong> ${location || 'Salle de réunion du Président du Conseil d’Administration, 9ᵉ étage, siège SEEG, Libreville.'}</p>
    <p>Nous vous prions de bien vouloir vous présenter <strong>15 minutes avant l'heure de l'entretien</strong>, muni(e) de votre carte professionnelle, badge, ou de toute autre pièce d'identité en cours de validité.</p>
    <p>Nous restons à votre disposition pour toutes informations complémentaires.</p>
  </div>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      to,
      candidateFullName,
      jobTitle,
      date,
      time,
      location,
      applicationId,
    } = req.body || {};

    if (!candidateFullName || !jobTitle || !date || !time) {
      return res.status(400).json({ error: 'Missing fields: candidateFullName, jobTitle, date, time' });
    }

    const smtpHost = process.env.VITE_SMTP_HOST as string;
    const smtpPort = Number(process.env.VITE_SMTP_PORT || 587);
    const smtpSecure = String(process.env.VITE_SMTP_SECURE || 'false') === 'true';
    const smtpUser = process.env.VITE_SMTP_USER as string;
    const smtpPass = process.env.VITE_SMTP_PASSWORD as string;
    const from = (process.env.VITE_SMTP_FROM as string) || `One HCM - SEEG Talent Source <${smtpUser}>`;

    // mail destinataire de test si none
    const finalTo = String(to || smtpUser);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const html = buildInterviewEmailHtml({ candidateFullName, jobTitle, date, time, location });

    const info = await transporter.sendMail({
      from,
      to: finalTo,
      subject: `Convocation à l'entretien – ${jobTitle}`,
      html,
    });

    // Log email in Supabase
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      await supabase.from('email_logs').insert({
        to: finalTo,
        subject: `Convocation à l'entretien – ${jobTitle}`,
        html,
        application_id: applicationId || null,
        category: 'interview_invitation',
        provider_message_id: info?.messageId || null,
        sent_at: new Date().toISOString(),
      });
    } catch (_e) {
      // ne bloque pas la réponse si l’insertion échoue
    }

    return res.status(200).json({ ok: true, messageId: info?.messageId });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message || 'Internal error' });
  }
}

