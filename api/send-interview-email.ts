/* eslint-disable @typescript-eslint/no-explicit-any */
// Types pour les requêtes API
interface ApiRequest {
  method?: string;
  body?: any;
  on: (event: string, callback: (data: any) => void) => void;
}

interface ApiResponse {
  status: (code: number) => {
    json: (data: any) => void;
  };
}

// Assure le runtime Node (et non Edge) en production Vercel
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const nodemailer = (await import('nodemailer')).default;
    const { createClient } = await import('@supabase/supabase-js');

    // Support both VITE_* and server-side env names in production
    const smtpHost = (process.env.SMTP_HOST || process.env.VITE_SMTP_HOST) as string;
    const smtpPort = Number(process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || 587);
    const smtpSecure = String(process.env.SMTP_SECURE || process.env.VITE_SMTP_SECURE || 'false') === 'true';
    const smtpUser = (process.env.SMTP_USER || process.env.VITE_SMTP_USER) as string;
    const smtpPass = (process.env.SMTP_PASSWORD || process.env.VITE_SMTP_PASSWORD) as string;
    const from = (process.env.SMTP_FROM as string) || (process.env.VITE_SMTP_FROM as string) || (smtpUser ? `One HCM - SEEG Talent Source <${smtpUser}>` : undefined);

    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) as string;
    const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY) as string;
    const supabase = (supabaseUrl && supabaseAnonKey)
      ? createClient(supabaseUrl, supabaseAnonKey)
      : null;

    // Tolérant: certains environnements ne fournissent pas req.body parsé
    let body: any = req.body;
    if (!body || typeof body !== 'object') {
      body = await new Promise<any>((resolve, reject) => {
        try {
          let raw = '';
          req.on('data', (chunk) => (raw += chunk));
          req.on('end', () => {
            try {
              resolve(raw ? JSON.parse(raw) : {});
            } catch (e) {
              resolve({});
            }
          });
          req.on('error', reject);
        } catch (e) {
          resolve({});
        }
      });
    }

    const {
      to,
      candidateFullName,
      candidateEmail,
      jobTitle,
      date,
      time,
      location,
      applicationId,
      interviewType = 'entretien', // Par défaut 'entretien', peut être 'simulation'
      interviewMode = 'presentiel', // Par défaut 'presentiel', peut être 'distanciel'
      videoLink, // Lien de visioconférence si mode distanciel
    } = body || {};

    console.log('📧 [EMAIL DEBUG] Données reçues:', {
      to,
      candidateFullName,
      candidateEmail,
      jobTitle,
      date,
      time,
      location,
      applicationId,
      interviewType,
      interviewMode,
      videoLink
    });

    // Log critique pour debug
    console.error('🚨 [EMAIL DEBUG] INTERVIEW TYPE REÇU:', interviewType);
    console.error('🚨 [EMAIL DEBUG] IS SIMULATION:', interviewType === 'simulation');

    if (!candidateFullName || !jobTitle || !date || !time) {
      res.status(400).json({ error: 'Missing fields: candidateFullName, jobTitle, date, time' });
      return;
    }

    // Récupérer le genre (priorité users.sexe, fallback candidate_profiles.gender)
    let candidateGender = 'Non renseigné';
    if (applicationId && supabase) {
      try {
        const { data: candidateData } = await supabase
          .from('applications')
          .select(`
            candidate_id,
            users:users!applications_candidate_id_fkey(sexe),
            candidate_profiles!left(gender)
          `)
          .eq('id', applicationId)
          .single();
        // @ts-expect-error dynamic
        const sexe = candidateData?.users?.sexe as string | undefined;
        // @ts-expect-error dynamic
        const profileGender = candidateData?.candidate_profiles?.gender as string | undefined;
        candidateGender = (sexe === 'F' || sexe === 'Femme') ? 'Femme' : (sexe === 'M' || sexe === 'Homme') ? 'Homme' : (profileGender || 'Non renseigné');
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

    // Contenu adapté selon le type (entretien ou simulation)
    const isSimulation = interviewType === 'simulation';
    const eventType = isSimulation ? 'simulation' : 'entretien de recrutement';
    const eventTypeCapitalized = isSimulation ? 'Simulation' : 'Entretien de recrutement';
    const isDistanciel = interviewMode === 'distanciel';
    
    // Déterminer le lieu selon le mode
    let finalLocation = location;
    if (!finalLocation) {
      if (isDistanciel) {
        finalLocation = "En ligne (visioconférence)";
      } else {
        finalLocation = isSimulation 
          ? "Salle de simulation au 9ᵉ étage du siège de la SEEG sis à Libreville."
          : "Salle de réunion du Président du Conseil d'Administration au 9ᵉ étage du siège de la SEEG sis à Libreville.";
      }
    }
    
    // Texte de préparation adapté au mode
    let preparationText = '';
    if (isDistanciel) {
      preparationText = `Nous vous prions de bien vouloir vous connecter <strong>10 minutes avant l'heure de ${isSimulation ? 'la simulation' : "l'entretien"}</strong> via le lien de visioconférence fourni ci-dessous. Assurez-vous d'avoir une connexion internet stable, une webcam et un microphone fonctionnels.`;
    } else {
      preparationText = isSimulation
        ? `Nous vous prions de bien vouloir vous présenter <strong>15 minutes avant l'heure de la simulation</strong>, ${muniAccord} de votre carte professionnelle, badge, ou de toute autre pièce d'identité en cours de validité.`
        : `Nous vous prions de bien vouloir vous présenter <strong>15 minutes avant l'heure de l'entretien</strong>, ${muniAccord} de votre carte professionnelle, badge, ou de toute autre pièce d'identité en cours de validité.`;
    }

    console.log('📧 [EMAIL DEBUG] Variables calculées:', {
      isSimulation,
      eventType,
      eventTypeCapitalized,
      finalLocation,
      preparationText: preparationText.substring(0, 100) + '...'
    });

    // Log critique pour debug
    console.error('🚨 [EMAIL DEBUG] FINAL CHECK:', {
      interviewType,
      isSimulation,
      eventType,
      finalLocation: finalLocation.substring(0, 50) + '...',
      preparationText: preparationText.substring(0, 50) + '...'
    });

    // Log persistant pour debug
    console.log('🔍 [EMAIL DEBUG] Type d\'événement détecté:', {
      interviewType,
      isSimulation,
      eventType,
      eventTypeCapitalized
    });

    // Générer le bloc lien de visio si distanciel
    const videoLinkBlock = isDistanciel && videoLink ? `
      <div style="margin:15px 0; padding:15px; background-color:#e3f2fd; border-left:4px solid #2196f3; border-radius:4px;">
        <p style="margin:0 0 8px; font-size:16px; font-weight:bold; color:#1565c0;">🎥 Lien de visioconférence :</p>
        <p style="margin:0; font-size:16px;">
          <a href="${videoLink}" style="color:#0066cc; text-decoration:underline; font-weight:500;" target="_blank">${videoLink}</a>
        </p>
        <p style="margin:8px 0 0; font-size:14px; color:#666;">
          <em>Cliquez sur le lien ci-dessus pour rejoindre la réunion en ligne.</em>
        </p>
      </div>
    ` : '';

    const html = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
        <tr>
          <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
            <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
              <tr>
                <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                  <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${candidateFullName}</strong>,</p>
                  <p style="margin:0 0 10px; font-size:16px;">Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> a retenu notre attention.</p>
                  <p style="margin:0 0 10px; font-size:16px;">Nous vous invitons à un ${eventType} qui se tiendra ${isDistanciel ? 'en ligne' : ''} le&nbsp;:</p>
                  <p style="margin:0 0 10px; font-size:16px;"><strong>Date :</strong> ${formattedDate}<br/>
                  <strong>Heure :</strong> ${formattedTime}<br/>
                  <strong>${isDistanciel ? 'Mode' : 'Lieu'} :</strong> ${finalLocation}</p>
                  ${videoLinkBlock}
                  <p style="margin:0 0 10px; font-size:16px;">${preparationText}</p>
                  <p style="margin:0 0 10px; font-size:16px;">Nous restons à votre disposition pour toutes informations complémentaires.</p>
                  <br/>
                  <p style="margin:0 0 8px; font-size:16px;">Cordialement,</p>
                  <p style="margin:0 0 6px; font-size:16px;"><strong>Équipe Support</strong></p>
                  <p style="margin:0 0 6px; font-size:16px;"><strong>OneHCM | Talent source</strong></p>
                  <p style="margin:0 0 6px; font-size:16px;"><strong><a href="https://www.seeg-talentsource.com" style="color: #0066cc; text-decoration: underline;">https://www.seeg-talentsource.com</a></strong></p>
                  <br/>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                    <tr>
                      <td align="left" style="padding:0 !important;margin:0 !important;">
                        <img src="https://www.seeg-talentsource.com/LOGO%20HCM4.png" alt="OneHCM Logo" style="display:block;height:44px;border:0;outline:none;text-decoration:none;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;

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
           subject: `Invitation à une ${eventTypeCapitalized} – Poste de ${jobTitle}`,
           html,
         });
         console.log('✅ [EMAIL DEBUG] Email envoyé via SMTP:', info.messageId);
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
            subject: `Invitation à une ${eventTypeCapitalized} – Poste de ${jobTitle}`,
            html,
          }),
        });
        if (resendResp.ok) {
          const resendData = await resendResp.json();
          info = { messageId: (resendData as any)?.id };
          emailSent = true;
        } else {
          const errTxt = await resendResp.text();
          console.error('[send-interview-email] Resend failed:', resendResp.status, errTxt);
        }
      } catch {
        // ignore
      }
    }

    if (!emailSent) {
      const providerState = {
        smtpConfigured: Boolean(smtpHost && smtpUser && smtpPass),
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
      };
      console.error('❌ [EMAIL DEBUG] Email sending failed.', providerState);
      console.error('❌ [EMAIL DEBUG] SMTP Config:', {
        host: smtpHost ? 'configured' : 'missing',
        user: smtpUser ? 'configured' : 'missing',
        pass: smtpPass ? 'configured' : 'missing'
      });
      res.status(500).json({ error: 'EMAIL_SENDING_FAILED', details: providerState });
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
    console.error('[send-interview-email] Uncaught error:', e);
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
