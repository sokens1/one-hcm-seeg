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
      userEmail,
      firstName,
      lastName,
      phone,
      matricule,
      dateOfBirth,
      sexe,
      adresse,
    } = body || {};

    console.log('📧 [ACCESS REQUEST] Données reçues:', {
      userEmail,
      firstName,
      lastName,
      phone,
      matricule,
    });

    // Validation des données
    if (!userEmail || !firstName || !lastName) {
      res.status(400).json({ error: 'Données manquantes: userEmail, firstName, lastName' });
      return;
    }

    console.log('📧 [ACCESS REQUEST] Configuration SMTP:', {
      host: smtpHost ? 'configured' : 'missing',
      user: smtpUser ? 'configured' : 'missing',
      pass: smtpPass ? 'configured' : 'missing'
    });

    // Email pour l'administrateur
    const adminEmailHtml = `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; padding:0;">
        <tr>
          <td align="left" style="padding:0;">
            <table width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="margin:0; padding:0;">
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left" style="padding:20px 0;">
                        <img src="https://i.ibb.co/qWBPPhF/seeg-logo.png" alt="SEEG Logo" width="120" style="display:block;">
                      </td>
                    </tr>
                  </table>
                  
                  <h2 style="color:#1e3a8a; margin:20px 0 10px 0; font-size:20px;">Nouvelle Demande d'Accès - Candidat Interne</h2>
                  
                  <p style="color:#333; line-height:1.6; margin:10px 0;">
                    Un candidat interne sans email professionnel SEEG a créé un compte et est en attente de validation.
                  </p>

                  <div style="background-color:#f3f4f6; padding:20px; border-left:4px solid #f59e0b; margin:20px 0;">
                    <h3 style="color:#1e3a8a; margin:0 0 15px 0; font-size:16px;">Informations du Candidat</h3>
                    <table style="width:100%; color:#333;">
                      <tr>
                        <td style="padding:5px 0;"><strong>Nom complet :</strong></td>
                        <td style="padding:5px 0;">${data.firstName} ${data.lastName}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;"><strong>Email :</strong></td>
                        <td style="padding:5px 0;">${data.userEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;"><strong>Téléphone :</strong></td>
                        <td style="padding:5px 0;">${data.phone}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;"><strong>Matricule :</strong></td>
                        <td style="padding:5px 0;">${data.matricule}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;"><strong>Date de naissance :</strong></td>
                        <td style="padding:5px 0;">${new Date(data.dateOfBirth).toLocaleDateString('fr-FR')}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;"><strong>Sexe :</strong></td>
                        <td style="padding:5px 0;">${data.sexe === 'M' ? 'Homme' : 'Femme'}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;"><strong>Adresse :</strong></td>
                        <td style="padding:5px 0;">${data.adresse}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="background-color:#fef3c7; padding:15px; border-radius:5px; margin:20px 0;">
                    <p style="margin:0; color:#92400e;">
                      ⚠️ <strong>Action requise :</strong> Veuillez vérifier et valider cette demande d'accès dans le tableau de bord administrateur.
                    </p>
                  </div>

                  <p style="color:#666; font-size:12px; margin-top:30px; border-top:1px solid #e5e7eb; padding-top:15px;">
                    Cet email a été envoyé automatiquement par la plateforme OneHCM - SEEG Talent Source.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    // Email pour le candidat
    const candidateEmailHtml = `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0; padding:0;">
        <tr>
          <td align="left" style="padding:0;">
            <table width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="margin:0; padding:0;">
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left" style="padding:20px 0;">
                        <img src="https://i.ibb.co/qWBPPhF/seeg-logo.png" alt="SEEG Logo" width="120" style="display:block;">
                      </td>
                    </tr>
                  </table>
                  
                  <h2 style="color:#1e3a8a; margin:20px 0 10px 0; font-size:20px;">Demande d'Accès en Attente de Validation</h2>
                  
                  <p style="color:#333; line-height:1.6; margin:10px 0;">
                    Bonjour <strong>${data.firstName} ${data.lastName}</strong>,
                  </p>

                  <p style="color:#333; line-height:1.6; margin:10px 0;">
                    Votre demande d'accès à la plateforme OneHCM a bien été enregistrée. Cependant, en tant que candidat interne sans email professionnel SEEG, votre compte est actuellement <strong>en attente de validation</strong> par notre équipe.
                  </p>

                  <div style="background-color:#dbeafe; padding:20px; border-radius:5px; margin:20px 0;">
                    <h3 style="color:#1e3a8a; margin:0 0 15px 0; font-size:16px;">Vos Informations</h3>
                    <table style="width:100%; color:#333;">
                      <tr>
                        <td style="padding:5px 0;"><strong>Email :</strong></td>
                        <td style="padding:5px 0;">${data.userEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;"><strong>Téléphone :</strong></td>
                        <td style="padding:5px 0;">${data.phone}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;"><strong>Matricule :</strong></td>
                        <td style="padding:5px 0;">${data.matricule}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="background-color:#fef3c7; padding:15px; border-radius:5px; margin:20px 0;">
                    <p style="margin:0; color:#92400e;">
                      <strong>Prochaines étapes :</strong><br>
                      Notre équipe va vérifier vos informations et valider votre compte dans les plus brefs délais. Vous recevrez un email de confirmation une fois votre compte activé.
                    </p>
                  </div>

                  <p style="color:#333; line-height:1.6; margin:10px 0;">
                    Si vous avez des questions, n'hésitez pas à nous contacter.
                  </p>

                  <p style="color:#333; line-height:1.6; margin:10px 0;">
                    Cordialement,<br>
                    <strong>L'équipe OneHCM - SEEG Talent Source</strong>
                  </p>

                  <p style="color:#666; font-size:12px; margin-top:30px; border-top:1px solid #e5e7eb; padding-top:15px;">
                    Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const serif = ", Georgia, serif";

    // Envoi via SMTP
    let adminEmailSent = false;
    let candidateEmailSent = false;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass },
        });

        // Email à l'admin
        const adminInfo = await transporter.sendMail({
          from: from || smtpUser,
          to: smtpUser, // support@seeg-talentsource.com
          subject: '🔔 Nouvelle Demande d\'Accès - Candidat Interne',
          html: adminEmailHtml,
        });
        console.log('✅ [ACCESS REQUEST] Email admin envoyé via SMTP:', adminInfo.messageId);
        adminEmailSent = true;

        // Email au candidat
        const candidateInfo = await transporter.sendMail({
          from: from || smtpUser,
          to: userEmail,
          subject: 'Demande d\'Accès en Attente de Validation',
          html: candidateEmailHtml,
        });
        console.log('✅ [ACCESS REQUEST] Email candidat envoyé via SMTP:', candidateInfo.messageId);
        candidateEmailSent = true;

      } catch (smtpError: any) {
        console.error('❌ [ACCESS REQUEST] Erreur SMTP:', smtpError);
      }
    }

    // Fallback via Resend si SMTP échoue
    if ((!adminEmailSent || !candidateEmailSent) && process.env.RESEND_API_KEY) {
      try {
        if (!adminEmailSent) {
          const resendResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: (process.env.RESEND_FROM as string) || from || `SEEG Recrutement <${smtpUser || 'no-reply@seeg-talentsource.com'}>`,
              to: smtpUser || 'support@seeg-talentsource.com',
              subject: '🔔 Nouvelle Demande d\'Accès - Candidat Interne',
              html: adminEmailHtml,
            }),
          });
          if (resendResp.ok) {
            console.log('✅ [ACCESS REQUEST] Email admin envoyé via Resend');
            adminEmailSent = true;
          }
        }

        if (!candidateEmailSent) {
          const resendResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: (process.env.RESEND_FROM as string) || from || `SEEG Recrutement <${smtpUser || 'no-reply@seeg-talentsource.com'}>`,
              to: userEmail,
              subject: 'Demande d\'Accès en Attente de Validation',
              html: candidateEmailHtml,
            }),
          });
          if (resendResp.ok) {
            console.log('✅ [ACCESS REQUEST] Email candidat envoyé via Resend');
            candidateEmailSent = true;
          }
        }
      } catch (resendError: any) {
        console.error('❌ [ACCESS REQUEST] Erreur Resend:', resendError);
      }
    }

    if (!adminEmailSent && !candidateEmailSent) {
      const providerState = {
        smtpConfigured: Boolean(smtpHost && smtpUser && smtpPass),
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
      };
      console.error('❌ [ACCESS REQUEST] Email sending failed.', providerState);
      res.status(500).json({ error: 'EMAIL_SENDING_FAILED', details: providerState });
      return;
    }

    res.status(200).json({
      ok: true,
      emailsSent: { admin: adminEmailSent, candidate: candidateEmailSent }
    });

  } catch (e: any) {
    console.error('[send-access-request-email] Uncaught error:', e);
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
