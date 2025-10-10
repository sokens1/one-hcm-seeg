/* eslint-disable @typescript-eslint/no-explicit-any */
// API pour envoyer un email de refus d'accès
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

    // Support both VITE_* and server-side env names
    const smtpHost = (process.env.SMTP_HOST || process.env.VITE_SMTP_HOST) as string;
    const smtpPort = Number(process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || 587);
    const smtpSecure = String(process.env.SMTP_SECURE || process.env.VITE_SMTP_SECURE || 'false') === 'true';
    const smtpUser = (process.env.SMTP_USER || process.env.VITE_SMTP_USER) as string;
    const smtpPass = (process.env.SMTP_PASSWORD || process.env.VITE_SMTP_PASSWORD) as string;
    const from = (process.env.SMTP_FROM as string) || (process.env.VITE_SMTP_FROM as string) || (smtpUser ? `One HCM - SEEG Talent Source <${smtpUser}>` : undefined);

    // Parser le body
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
      sexe,
      reason,
    } = body || {};

    console.log('📧 [ACCESS REJECTED] Données reçues:', {
      userEmail,
      firstName,
      lastName,
      reason: reason?.substring(0, 50) + '...',
    });

    if (!userEmail || !firstName || !lastName || !reason) {
      res.status(400).json({ error: 'Données manquantes' });
      return;
    }

    const serif = ", Georgia, serif";
    const title = sexe === 'F' ? 'Madame' : 'Monsieur';

    const rejectedEmailHtml = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
        <tr>
          <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
            <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
              <tr>
                <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                  <h2 style="color:#dc2626; margin:20px 0 10px 0; font-size:20px;">Demande d'Accès Refusée</h2>
                  
                  <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${firstName} ${lastName}</strong>,</p>
                  
                  <p style="margin:0 0 10px; font-size:16px;">
                    Nous vous informons que votre demande d'accès à la plateforme <strong>OneHCM - SEEG Talent Source</strong> n'a pas pu être validée.
                  </p>

                  <div style="background-color:#fee2e2; padding:20px; border-left:4px solid #dc2626; margin:20px 0;">
                    <h3 style="color:#991b1b; margin:0 0 15px 0; font-size:16px;">Motif du refus</h3>
                    <p style="margin:0; color:#991b1b;">${reason}</p>
                  </div>

                  <p style="margin:0 0 10px; font-size:16px;">
                    Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions, n'hésitez pas à contacter notre équipe support.
                  </p>

                  <div style="background-color:#dbeafe; padding:15px; border-radius:5px; margin:20px 0;">
                    <p style="margin:0; color:#1e40af;">
                      📞 <strong>Contact Support :</strong> support@seeg-talentsource.com
                    </p>
                  </div>

                  <br/>
                  <p style="margin:0 0 8px; font-size:16px;">Cordialement,</p>
                  <p style="margin:0 0 6px; font-size:16px;"><strong>L'équipe OneHCM - SEEG Talent Source</strong></p>
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
      </table>
    `;

    // Envoi via SMTP
    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const info = await transporter.sendMail({
          from: from || smtpUser,
          to: userEmail,
          subject: 'Demande d\'Accès Refusée - OneHCM',
          html: rejectedEmailHtml,
        });
        console.log('✅ [ACCESS REJECTED] Email envoyé via SMTP:', info.messageId);
        emailSent = true;

      } catch (smtpError: any) {
        console.error('❌ [ACCESS REJECTED] Erreur SMTP:', smtpError);
      }
    }

    // Fallback via Resend
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
            to: userEmail,
            subject: 'Demande d\'Accès Refusée - OneHCM',
            html: rejectedEmailHtml,
          }),
        });
        if (resendResp.ok) {
          console.log('✅ [ACCESS REJECTED] Email envoyé via Resend');
          emailSent = true;
        }
      } catch (resendError: any) {
        console.error('❌ [ACCESS REJECTED] Erreur Resend:', resendError);
      }
    }

    if (!emailSent) {
      const providerState = {
        smtpConfigured: Boolean(smtpHost && smtpUser && smtpPass),
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
      };
      console.error('❌ [ACCESS REJECTED] Email sending failed.', providerState);
      res.status(500).json({ error: 'EMAIL_SENDING_FAILED', details: providerState });
      return;
    }

    res.status(200).json({ ok: true });

  } catch (e: any) {
    console.error('[send-access-rejected-email] Uncaught error:', e);
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
}
