/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const nodemailer = (await import('nodemailer')).default;
    const { createClient } = await import('@supabase/supabase-js');

    const smtpHost = process.env.VITE_SMTP_HOST as string;
    const smtpPort = Number(process.env.VITE_SMTP_PORT || 587);
    const smtpSecure = String(process.env.VITE_SMTP_SECURE || 'false') === 'true';
    const smtpUser = process.env.VITE_SMTP_USER as string;
    const smtpPass = process.env.VITE_SMTP_PASSWORD as string;
    const from = (process.env.VITE_SMTP_FROM as string) || (smtpUser ? `One HCM - SEEG Talent Source <${smtpUser}>` : undefined);

    const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;
    const supabase = (supabaseUrl && supabaseAnonKey)
      ? createClient(supabaseUrl, supabaseAnonKey)
      : null;

    const {
      to,
      candidateFullName,
      candidateEmail,
      jobTitle,
      date,
      time,
      location,
      applicationId,
    } = (req.body as any) || {};

    if (!candidateFullName || !jobTitle || !date || !time) {
      res.status(400).json({ error: 'Missing fields: candidateFullName, jobTitle, date, time' });
      return;
    }

    // Optionnel: récupérer le genre depuis Supabase pour accords
    let candidateGender = 'Non renseigné';
    if (applicationId && supabase) {
      try {
        const { data: candidateData } = await supabase
          .from('applications')
          .select(`candidate_id, candidate_profiles!inner(gender)`) 
          .eq('id', applicationId)
          .single();
        // @ts-expect-error dynamic
        if (candidateData?.candidate_profiles?.gender) {
          // @ts-expect-error dynamic
          candidateGender = candidateData.candidate_profiles.gender as string;
        }
      } catch {
        // Non bloquant
      }
    }

    const isFemale = candidateGender === 'Femme';
    const title = isFemale ? 'Madame' : 'Monsieur';
    const muniAccord = isFemale ? 'munie' : 'muni';
    const dateObj = new Date(`${date}T${String(time).slice(0, 5)}`);
    const formattedDate = dateObj.toLocaleDateString('fr-FR');
    const formattedTime = String(time).slice(0, 5);
    const serif = ", Georgia, serif";

    const html = `
      <div style="font-family: ui-serif${serif}; color:#000; max-width:760px; margin:0 auto; font-size:16px; line-height:1.7;">
        <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${candidateFullName}</strong>,</p>
        <p style="margin:0 0 10px; font-size:16px;">Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> a retenu notre attention.</p>
        <p style="margin:0 0 10px; font-size:16px;">Nous vous invitons à un entretien de recrutement qui se tiendra le&nbsp;:</p>
        <p style="margin:0 0 10px; font-size:16px;"><strong>Date :</strong> ${formattedDate}<br/>
        <strong>Heure :</strong> ${formattedTime}<br/>
        <strong>Lieu :</strong> ${location || "Salle de réunion du Président du Conseil d\'Administration au 9ᵉ étage du siège de la SEEG sis à Libreville."}</p>
        <p style="margin:0 0 10px; font-size:16px;">Nous vous prions de bien vouloir vous présenter <strong>15 minutes avant l'heure de l'entretien</strong>, ${muniAccord} de votre carte professionnelle, badge, ou de toute autre pièce d'identité en cours de validité.</p>
        <p style="margin:0 0 10px; font-size:16px;">Nous restons à votre disposition pour toutes informations complémentaires.</p>
        <p style="margin:0 0 10px; font-size:16px;"><strong>PS: Presenter-vous avec tous les documents fournis sur la plateforme, badge professionnel ainsi que votre acte de naissance</strong></p>
        <br/>
        <p style="margin:0 0 8px; font-size:16px;">Cordialement,</p>
        <p style="margin:0 0 6px; font-size:16px;"><strong>Équipe Support</strong></p>
        <p style="margin:0 0 6px; font-size:16px;"><strong>OneHCM | Talent source</strong></p>
        <p style="margin:0 0 6px; font-size:16px;"><strong><a href="https://www.seeg-talentsource.com" style="color: #0066cc; text-decoration: underline;">https://www.seeg-talentsource.com</a></strong></p>
        <br/>
        <div style="display: flex; align-items: center; margin-top: 15px;">
          <img src="https://www.seeg-talentsource.com/LOGO%20HCM4.png" alt="OneHCM Logo" style="height: 44px; margin-right: 10px;" />
        </div>
      </div>`;

    // Envoi SMTP
    let info: any;
    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass },
        });

        info = await transporter.sendMail({
          from: from || smtpUser,
          to: String(candidateEmail || to || smtpUser),
          subject: `Invitation à un entretien de recrutement – Poste de ${jobTitle}`,
          html,
        });
        emailSent = true;
      } catch (e) {
        // SMTP a échoué, essai fallback si dispo
      }
    }

    // Fallback Resend si présent
    if (!emailSent && process.env.RESEND_API_KEY) {
      try {
        const resendResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: (process.env.RESEND_FROM as string) || from || `SEEG Recrutement <${smtpUser || 'no-reply@seeg-talentsource.com'}>`,
            to: String(candidateEmail || to || smtpUser),
            subject: `Invitation à un entretien de recrutement – Poste de ${jobTitle}`,
            html,
          }),
        });
        if (resendResp.ok) {
          const resendData = await resendResp.json();
          info = { messageId: (resendData as any)?.id };
          emailSent = true;
        } else {
          // ignore, on renverra l'erreur plus bas si rien n'a marché
        }
      } catch {
        // ignore
      }
    }

    if (!emailSent) {
      res.status(500).json({ error: 'Email sending failed (no provider succeeded)' });
      return;
    }

    // Log Supabase (non bloquant)
    try {
      if (supabase) {
        await supabase.from('email_logs').insert({
          to: String(candidateEmail || to || smtpUser),
          subject: `Invitation à un entretien de recrutement – Poste de ${jobTitle}`,
          html,
          application_id: applicationId || null,
          category: 'interview_invitation',
          provider_message_id: info?.messageId || null,
          sent_at: new Date().toISOString(),
        });
      }
    } catch {
      // non bloquant
    }

    res.status(200).json({ ok: true, messageId: info?.messageId || null });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}

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

