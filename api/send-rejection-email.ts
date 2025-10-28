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
      applicationId,
    } = body || {};

    console.log('📧 [REJECTION EMAIL DEBUG] Données reçues:', {
      to,
      candidateFullName,
      candidateEmail,
      jobTitle,
      applicationId
    });

    if (!candidateFullName || !jobTitle) {
      res.status(400).json({ error: 'Missing fields: candidateFullName, jobTitle' });
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
    const serif = ", Georgia, serif";

    const html = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
        <tr>
          <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
            <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
              <tr>
                <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                  <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${candidateFullName}</strong>,</p>
                  
                  <p style="margin:0 0 10px; font-size:16px;">
                    Nous vous remercions pour l'intérêt que vous avez porté à rejoindre l'équipe dirigeante de la SEEG et pour le temps que vous avez consacré à votre candidature.
                  </p>
                  
                  <p style="margin:0 0 10px; font-size:16px;">
                    Après un examen approfondi de celle-ci, nous sommes au regret de vous informer que votre profil n'a malheureusement pas été retenu pour le poste de <strong>${jobTitle}</strong> au sein de la SEEG.
                  </p>
                  
                  <p style="margin:0 0 10px; font-size:16px;">
                    Nous vous souhaitons beaucoup de succès dans vos projets professionnels à venir et nous permettons de conserver votre dossier, au cas où une nouvelle opportunité en adéquation avec votre profil se présenterait.
                  </p>
                  
                  <br/>
                  <p style="margin:0 0 8px; font-size:16px;">Salutations distinguées.</p>
                  <br/>
                  <p style="margin:0 0 6px; font-size:16px;"><strong>L'équipe de recrutement</strong></p>
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
           subject: `Candidature au poste de ${jobTitle} – SEEG`,
           html,
         });
         console.log('✅ [REJECTION EMAIL] Email envoyé via SMTP:', info.messageId);
         emailSent = true;
      } catch (e) {
        console.error('❌ [REJECTION EMAIL] Erreur SMTP:', e);
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
            subject: `Candidature au poste de ${jobTitle} – SEEG`,
            html,
          }),
        });
        if (resendResp.ok) {
          const resendData = await resendResp.json();
          info = { messageId: (resendData as any)?.id };
          emailSent = true;
          console.log('✅ [REJECTION EMAIL] Email envoyé via Resend');
        } else {
          const errTxt = await resendResp.text();
          console.error('[send-rejection-email] Resend failed:', resendResp.status, errTxt);
        }
      } catch (err) {
        console.error('[send-rejection-email] Resend exception:', err);
      }
    }

    if (!emailSent) {
      const providerState = {
        smtpConfigured: Boolean(smtpHost && smtpUser && smtpPass),
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
      };
      console.error('❌ [REJECTION EMAIL] Email sending failed.', providerState);
      res.status(500).json({ error: 'EMAIL_SENDING_FAILED', details: providerState });
      return;
    }

    // Log Supabase (non bloquant)
    try {
      if (supabase) {
        await supabase.from('email_logs').insert({
          to: String(candidateEmail || to || smtpUser),
          subject: `Candidature au poste de ${jobTitle} – SEEG`,
          html,
          application_id: applicationId || null,
          category: 'rejection',
          provider_message_id: info?.messageId || null,
          sent_at: new Date().toISOString(),
        });
      }
    } catch {
      // non bloquant
    }

    res.status(200).json({ ok: true, messageId: info?.messageId || null });
  } catch (e: any) {
    console.error('[send-rejection-email] Uncaught error:', e);
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}

