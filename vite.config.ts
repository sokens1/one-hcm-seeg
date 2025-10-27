/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-toast'
          ],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  server: {
    host: "::",
    port: 8080,
    // Middleware custom pour servir /api/send-interview-email en dev (même port)
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/send-interview-email') {
          try {
            // console.log('[DEV API] POST /api/send-interview-email');
            // Lire le corps JSON
            const chunks: Buffer[] = [];
            await new Promise<void>((resolve, reject) => {
              req.on('data', (c) => chunks.push(Buffer.from(c)));
              req.on('end', () => resolve());
              req.on('error', reject);
            });
            const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf-8')) : {};

            //@ts-expect-error fix it later
            const nodemailer = (await import('nodemailer')).default;
            const { createClient } = await import('@supabase/supabase-js');

            const smtpHost = process.env.VITE_SMTP_HOST as string;
            const smtpPort = Number(process.env.VITE_SMTP_PORT || 587);
            const smtpSecure = String(process.env.VITE_SMTP_SECURE || 'false') === 'true';
            const smtpUser = process.env.VITE_SMTP_USER as string;
            const smtpPass = process.env.VITE_SMTP_PASSWORD as string;
            const from = (process.env.VITE_SMTP_FROM as string) || `One HCM - SEEG Talent Source <${smtpUser}>`;

            const {
              to,
              candidateFullName,
              jobTitle,
              date,
              time,
              location,
              applicationId,
            } = body || {};

            if (!candidateFullName || !jobTitle || !date || !time) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing fields: candidateFullName, jobTitle, date, time' }));
              return;
            }

            // Récupérer le genre du candidat depuis la base de données
            let candidateGender = 'Non renseigné';
            if (applicationId) {
              try {
                const supabaseUrl = 'https://fyiitzndlqcnyluwkpqp.supabase.co';
                const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWl0em5kbHFjbnlsdXdrcHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDkxNTksImV4cCI6MjA3MTA4NTE1OX0.C3pTJmFapb9a2M6BLtb6AeKZX9SbkEikrosOIYJts9Q';
                const supabase = createClient(supabaseUrl, supabaseAnonKey);

                const { data: candidateData } = await supabase
                  .from('applications')
                  .select(`
                                  candidate_id,
                                  candidate_profiles!inner(gender)
                                `)
                  .eq('id', applicationId)
                  .single();

                //@ts-expect-error fix it later
                if (candidateData?.candidate_profiles?.gender) {
                  //@ts-expect-error fix it later
                  candidateGender = candidateData.candidate_profiles.gender;
                }
              } catch (e) {
                //console.log('[DEV API plugin] Erreur récupération genre:', e);
              }
            }

            // Déterminer les accords selon le genre
            const isFemale = candidateGender === 'Femme';
            const title = isFemale ? 'Madame' : 'Monsieur';
            const muniAccord = isFemale ? 'munie' : 'muni';
            const dateObj = new Date(`${date}T${String(time).slice(0, 5)}`);
            const formattedDate = dateObj.toLocaleDateString('fr-FR');
            const formattedTime = String(time).slice(0, 5);
            const serif = ", Georgia, serif";
            const html = `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
              <tr>
                <td align="left" style="padding:0;margin:0;text-align:left;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td align="left" style="padding:0;margin:0;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                        <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${candidateFullName}</strong>,</p>
                        <p style="margin:0 0 10px; font-size:16px;">Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> a retenu notre attention.</p>
                        <p style="margin:0 0 10px; font-size:16px;">Nous vous invitons à un entretien de recrutement qui se tiendra le&nbsp;:</p>
                        <p style="margin:0 0 10px; font-size:16px;"><strong>Date :</strong> ${formattedDate}<br/>
                        <strong>Heure :</strong> ${formattedTime}<br/>
                        <strong>Lieu :</strong> ${location || "Salle de réunion du Président du Conseil d'Administration au 9ᵉ étage du siège de la SEEG sis à Libreville."}</p>
                        <p style="margin:0 0 10px; font-size:16px;">Nous vous prions de bien vouloir vous présenter <strong>15 minutes avant l'heure de l'entretien</strong>, ${muniAccord} de votre carte professionnelle,  badge, ou de toute autre pièce d'identité en cours de validité.</p>
                        <p style="margin:0 0 10px; font-size:16px;">Nous restons à votre disposition pour toutes informations complémentaires.</p>
                        <br/>
                        <p style="margin:0 0 8px; font-size:16px;">Cordialement,</p>
                        <p style="margin:0 0 6px; font-size:16px;"><strong>Équipe Support</strong></p>
                        <p style="margin:0 0 6px; font-size:16px;"><strong>OneHCM | Talent source</strong></p>
                        <p style="margin:0 0 6px; font-size:16px;"><strong><a href="https://www.seeg-talentsource.com" style="color: #0066cc; text-decoration: underline;">https://www.seeg-talentsource.com</a></strong></p>
                        <br/>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                          <tr>
                            <td align="left" style="padding:0;margin:0;">
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

            const transporter = nodemailer.createTransport({
              host: smtpHost,
              port: smtpPort,
              secure: smtpSecure,
              auth: { user: smtpUser, pass: smtpPass },
            });

            const info = await transporter.sendMail({
              from,
              to: String(to || smtpUser),
              subject: `Invitation à un entretien de recrutement – Poste de ${jobTitle}`,
              html,
            });
            //console.log('[DEV API] Email envoyé, messageId=', (info as any)?.messageId);

            // Log Supabase
            try {
              const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
              const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;
              const supabase = createClient(supabaseUrl, supabaseAnonKey);
              await supabase.from('email_logs').insert({
                to: String(to || smtpUser),
                subject: `Invitation à un entretien de recrutement – Poste de ${jobTitle}`,
                html,
                application_id: applicationId || null,
                category: 'interview_invitation',
                provider_message_id: info?.messageId || null,
                sent_at: new Date().toISOString(),
              });
            } catch (err) {
              //console.log('[DEV API] insertion email_logs échouée (non bloquant):', err);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');


            res.end(JSON.stringify({ ok: true, messageId: (info as any)?.messageId }));
            return;

          } catch (e: any) {
            //console.error('[DEV API] Erreur /api/send-interview-email:', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
            return;
          }
        }
        next();
      });
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Dev-only API: /api/send-interview-email (sert l'email SMTP sur le même port 8080)
    mode === 'development' && {
      name: 'dev-api-send-interview-email',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/send-interview-email') {
            try {
              //console.log('[DEV API plugin] POST /api/send-interview-email');
              const chunks: Buffer[] = [];
              await new Promise<void>((resolve, reject) => {
                req.on('data', (c) => chunks.push(Buffer.from(c)));
                req.on('end', () => resolve());
                req.on('error', reject);
              });
              const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf-8')) : {};
              //@ts-expect-error fix it later
              const nodemailer = (await import('nodemailer')).default;
              const { createClient } = await import('@supabase/supabase-js');

              // Configuration SMTP directe (hardcodée pour éviter les problèmes d'env)
              const smtpHost = 'smtp.gmail.com';
              const smtpPort = 587;
              const smtpSecure = false;
              const smtpUser = 'support@seeg-talentsource.com';
              const smtpPass = 'njev urja zsbc spfn';
              const from = 'One HCM - SEEG Talent Source <support@seeg-talentsource.com>';
              //console.log('[DEV API plugin] SMTP: host=', smtpHost, 'port=', smtpPort, 'secure=', smtpSecure, 'user=', smtpUser, 'pass=', smtpPass ? '***' : 'EMPTY');

              const { to, candidateFullName, jobTitle, date, time, location, applicationId, candidateEmail } = body || {};
              if (!candidateFullName || !jobTitle || !date || !time) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing fields: candidateFullName, jobTitle, date, time' }));
                return;
              }

              // Récupérer le genre du candidat depuis la base de données
              let candidateGender = 'Non renseigné';
              if (applicationId) {
                try {
                  const supabaseUrl = 'https://fyiitzndlqcnyluwkpqp.supabase.co';
                  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWl0em5kbHFjbnlsdXdrcHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDkxNTksImV4cCI6MjA3MTA4NTE1OX0.C3pTJmFapb9a2M6BLtb6AeKZX9SbkEikrosOIYJts9Q';
                  const supabase = createClient(supabaseUrl, supabaseAnonKey);

                  const { data: candidateData } = await supabase
                    .from('applications')
                    .select(`
                      candidate_id,
                      candidate_profiles!inner(gender)
                    `)
                    .eq('id', applicationId)
                    .single();

                  //@ts-expect-error fix it later
                  if (candidateData?.candidate_profiles?.gender) {
                    //@ts-expect-error fix it later
                    candidateGender = candidateData.candidate_profiles.gender;
                  }
                } catch (e) {
                  //console.log('[DEV API plugin] Erreur récupération genre:', e);
                }
              }

              // Déterminer les accords selon le genre
              const isFemale = candidateGender === 'Femme';
              const title = isFemale ? 'Madame' : 'Monsieur';
              const muniAccord = isFemale ? 'munie' : 'muni';
              const dateObj = new Date(`${date}T${String(time).slice(0, 5)}`);
              const formattedDate = dateObj.toLocaleDateString('fr-FR');
              const formattedTime = String(time).slice(0, 5);
              const serif = ", Georgia, serif";
              const html = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                <tr>
                  <td align="left" style="padding:0;margin:0;text-align:left;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                      <tr>
                        <td align="left" style="padding:0;margin:0;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                          <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${candidateFullName}</strong>,</p>
                          <p style="margin:0 0 10px; font-size:16px;">Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> a retenu notre attention.</p>
                          <p style="margin:0 0 10px; font-size:16px;">Nous vous invitons à un entretien de recrutement qui se tiendra le&nbsp;:</p>
                          <p style="margin:0 0 10px; font-size:16px;"><strong>Date :</strong> ${formattedDate}<br/>
                          <strong>Heure :</strong> ${formattedTime}<br/>
                          <strong>Lieu :</strong> ${location || "Salle de réunion du Président du Conseil d'Administration au 9ᵉ étage du siège de la SEEG sis à Libreville."}</p>
                          <p style="margin:0 0 10px; font-size:16px;">Nous vous prions de bien vouloir vous présenter <strong>15 minutes avant l'heure de l'entretien</strong>, ${muniAccord} de votre carte professionnelle, badge, ou de toute autre pièce d'identité en cours de validité.</p>
                          <p style="margin:0 0 10px; font-size:16px;">Nous restons à votre disposition pour toutes informations complémentaires.</p>
                          <br/>
                          <p style="margin:0 0 8px; font-size:16px;">Cordialement,</p>
                          <p style="margin:0 0 6px; font-size:16px;"><strong>Équipe Support</strong></p>
                          <p style="margin:0 0 6px; font-size:16px;"><strong>OneHCM | Talent source</strong></p>
                          <p style="margin:0 0 6px; font-size:16px;"><strong><a href="https://www.seeg-talentsource.com" style="color: #0066cc; text-decoration: underline;">https://www.seeg-talentsource.com</a></strong></p>
                          <br/>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                            <tr>
                              <td align="left" style="padding:0;margin:0;">
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

              // Essayer SMTP d'abord, puis fallback Resend si échec

              let info: any;
              let emailSent = false;

              if (smtpUser && smtpPass) {
                try {
                  const transporter = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpSecure, auth: { user: smtpUser, pass: smtpPass } });
                  info = await transporter.sendMail({ from, to: String(candidateEmail || to || smtpUser), subject: `Invitation à un entretien de recrutement – Poste de ${jobTitle}`, html });
                  //console.log('[DEV API plugin] Email envoyé via SMTP, messageId=', (info as any)?.messageId);
                  emailSent = true;
                } catch (smtpError) {
                  //console.log('[DEV API plugin] SMTP échoué, fallback Resend:', smtpError);
                }
              }

              // Fallback Resend si SMTP échoue (avec clé API hardcodée)
              if (!emailSent) {
                const resendApiKey = 're_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK';
                const resendFrom = 'SEEG Recrutement <support@seeg-talentsource.com>';
                //console.log('[DEV API plugin] Envoi via Resend...');

                const resendResp = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    from: resendFrom,
                    to: String(candidateEmail || to || smtpUser),
                    subject: `Invitation à un entretien de recrutement – Poste de ${jobTitle}`,
                    html,
                  }),
                });

                if (resendResp.ok) {
                  const resendData = await resendResp.json();
                  //@ts-expect-error fix it later
                  info = { messageId: resendData.id };
                  //console.log('[DEV API plugin] Email envoyé via Resend, messageId=', resendData.id);
                  emailSent = true;
                } else {
                  const resendError = await resendResp.json();
                  //@ts-expect-error fix it later
                  throw new Error(`Resend failed: ${resendError.message || resendResp.status}`);
                }
              }

              try {
                // Configuration Supabase hardcodée
                const supabaseUrl = 'https://fyiitzndlqcnyluwkpqp.supabase.co';
                const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWl0em5kbHFjbnlsdXdrcHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDkxNTksImV4cCI6MjA3MTA4NTE1OX0.C3pTJmFapb9a2M6BLtb6AeKZX9SbkEikrosOIYJts9Q';
                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                await supabase.from('email_logs').insert({
                  to: String(candidateEmail || to || smtpUser), subject: `Invitation à un entretien de recrutement – Poste de ${jobTitle}`, html,
                  application_id: applicationId || null, category: 'interview_invitation',
                  provider_message_id: (info as any)?.messageId || null, sent_at: new Date().toISOString()
                });
              } catch (err) {
                //console.log('[DEV API plugin] insertion email_logs échouée (non bloquant):', err);
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, messageId: (info as any)?.messageId }));
              return;
            } catch (e: any) {
              //console.error('[DEV API plugin] Erreur /api/send-interview-email:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
              return;
            }
          }
          next();
        });
      },
    },
    // Dev-only API: /api/send-welcome-email
    mode === 'development' && {
      name: 'dev-api-send-welcome-email',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/send-welcome-email') {
            try {
              const chunks: Buffer[] = [];
              await new Promise<void>((resolve, reject) => {
                req.on('data', (c) => chunks.push(Buffer.from(c)));
                req.on('end', () => resolve());
                req.on('error', reject);
              });
              const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf-8')) : {};
              //@ts-expect-error fix it later
              const nodemailer = (await import('nodemailer')).default;

              const smtpHost = 'smtp.gmail.com';
              const smtpPort = 587;
              const smtpSecure = false;
              const smtpUser = 'support@seeg-talentsource.com';
              const smtpPass = 'njev urja zsbc spfn';
              const from = 'One HCM - SEEG Talent Source <support@seeg-talentsource.com>';

               const { userEmail, firstName, lastName, sexe } = body || {};
               
               if (!userEmail || !firstName || !lastName) {
                 res.statusCode = 400;
                 res.setHeader('Content-Type', 'application/json');
                 res.end(JSON.stringify({ error: 'Données manquantes' }));
                 return;
               }
 
               const serif = ", Georgia, serif";
               const title = sexe === 'F' ? 'Madame' : 'Monsieur';
               
               const html = `
                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                   <tr>
                     <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
                       <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                         <tr>
                           <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                             <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${firstName} ${lastName}</strong>,</p>
                            <p style="margin:0 0 10px; font-size:16px;">Bienvenue sur la plateforme <strong>OneHCM - SEEG Talent Source</strong> !</p>
                            <p style="margin:0 0 10px; font-size:16px;">Votre inscription a été effectuée avec succès. Nous sommes ravis de vous compter parmi nos candidats.</p>
                            <p style="margin:0 0 10px; font-size:16px;"><strong>Prochaines étapes :</strong></p>
                            <ul style="margin:0 0 10px; padding-left:20px; font-size:16px;">
                              <li style="margin:0 0 5px;">Consultez les offres d'emploi disponibles</li>
                              <li style="margin:0 0 5px;">Postulez aux postes qui correspondent à votre profil</li>
                              <li style="margin:0 0 5px;">Suivez l'évolution de vos candidatures dans votre espace personnel</li>
                            </ul>
                            <p style="margin:0 0 10px; font-size:16px;">Nous vous souhaitons bonne chance dans votre recherche et restons à votre disposition pour tout renseignement complémentaire.</p>
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
                </table>
              `;

              const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: { user: smtpUser, pass: smtpPass },
              });

              const info = await transporter.sendMail({
                from,
                to: userEmail,
                subject: 'Bienvenue sur OneHCM - SEEG Talent Source',
                html,
              });
              
              console.log('✅ [WELCOME EMAIL] Email envoyé via SMTP:', info?.messageId);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, messageId: info?.messageId }));
              return;
            } catch (e: any) {
              console.error('❌ [WELCOME EMAIL] Erreur:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
              return;
            }
          }
          next();
        });
      },
    },
    // Dev-only API: /api/send-access-request-email
    mode === 'development' && {
      name: 'dev-api-send-access-request-email',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/send-access-request-email') {
            try {
              const chunks: Buffer[] = [];
              await new Promise<void>((resolve, reject) => {
                req.on('data', (c) => chunks.push(Buffer.from(c)));
                req.on('end', () => resolve());
                req.on('error', reject);
              });
              const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf-8')) : {};
              //@ts-expect-error fix it later
              const nodemailer = (await import('nodemailer')).default;

              const smtpHost = 'smtp.gmail.com';
              const smtpPort = 587;
              const smtpSecure = false;
              const smtpUser = 'support@seeg-talentsource.com';
              const smtpPass = 'njev urja zsbc spfn';
              const from = 'One HCM - SEEG Talent Source <support@seeg-talentsource.com>';

              const { userEmail, firstName, lastName, phone, matricule, dateOfBirth, sexe, adresse } = body || {};
              
              if (!userEmail || !firstName || !lastName) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Données manquantes' }));
                return;
              }

              const serif = ", Georgia, serif";
              const formattedDate = dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseigné';
              const sexeLabel = sexe === 'M' ? 'Homme' : sexe === 'F' ? 'Femme' : 'Non renseigné';

              // Email pour l'admin
              const adminHtml = `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                  <tr>
                    <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
                      <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                        <tr>
                          <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                            <h2 style="color:#1e3a8a; margin:20px 0 10px 0; font-size:20px;">🔔 Nouvelle Demande d'Accès - Candidat Interne</h2>
                            <p style="margin:0 0 10px; font-size:16px;">Un candidat interne sans email professionnel SEEG a créé un compte et est en attente de validation.</p>
                            <div style="background-color:#f3f4f6; padding:20px; border-left:4px solid #f59e0b; margin:20px 0;">
                              <h3 style="color:#1e3a8a; margin:0 0 15px 0; font-size:16px;">Informations du Candidat</h3>
                              <p style="margin:5px 0;"><strong>Nom complet :</strong> ${firstName} ${lastName}</p>
                              <p style="margin:5px 0;"><strong>Email :</strong> ${userEmail}</p>
                              <p style="margin:5px 0;"><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
                              <p style="margin:5px 0;"><strong>Matricule :</strong> ${matricule || 'Non renseigné'}</p>
                              <p style="margin:5px 0;"><strong>Date de naissance :</strong> ${formattedDate}</p>
                              <p style="margin:5px 0;"><strong>Sexe :</strong> ${sexeLabel}</p>
                              <p style="margin:5px 0;"><strong>Adresse :</strong> ${adresse || 'Non renseigné'}</p>
                            </div>
                            <p style="margin:0 0 10px; font-size:16px; color:#92400e;"><strong>⚠️ Action requise :</strong> Veuillez vérifier et valider cette demande d'accès dans le tableau de bord administrateur.</p>
                            <br/>
                            <p style="margin:0 0 8px; font-size:16px;">Cordialement,</p>
                            <p style="margin:0 0 6px; font-size:16px;"><strong>Système OneHCM</strong></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              `;

              // Email pour le candidat
              const candidateHtml = `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                  <tr>
                    <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
                      <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                        <tr>
                          <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                            <h2 style="color:#1e3a8a; margin:20px 0 10px 0; font-size:20px;">Demande d'Accès en Attente de Validation</h2>
                            <p style="margin:0 0 10px; font-size:16px;">Bonjour <strong>${firstName} ${lastName}</strong>,</p>
                            <p style="margin:0 0 10px; font-size:16px;">Votre demande d'accès à la plateforme OneHCM a bien été enregistrée. En tant que candidat interne sans email professionnel SEEG, votre compte est actuellement <strong>en attente de validation</strong> par notre équipe.</p>
                            <p style="margin:0 0 10px; font-size:16px;"><strong>Prochaines étapes :</strong></p>
                            <p style="margin:0 0 10px; font-size:16px;">Notre équipe va vérifier vos informations et valider votre compte dans les plus brefs délais. Vous recevrez un email de confirmation une fois votre compte activé.</p>
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

              const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: { user: smtpUser, pass: smtpPass },
              });

              // Envoyer à l'admin
              await transporter.sendMail({
                from,
                to: smtpUser,
                subject: '🔔 Nouvelle Demande d\'Accès - Candidat Interne',
                html: adminHtml,
              });
              console.log('✅ [ACCESS REQUEST] Email admin envoyé');

              // Envoyer au candidat
              await transporter.sendMail({
                from,
                to: userEmail,
                subject: 'Demande d\'Accès en Attente de Validation',
                html: candidateHtml,
              });
              console.log('✅ [ACCESS REQUEST] Email candidat envoyé');

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
              return;
            } catch (e: any) {
              console.error('❌ [ACCESS REQUEST] Erreur:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
              return;
            }
          }
          next();
        });
      },
    },
    // Dev-only API: /api/send-access-approved-email
    mode === 'development' && {
      name: 'dev-api-send-access-approved-email',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/send-access-approved-email') {
            try {
              const chunks: Buffer[] = [];
              await new Promise<void>((resolve, reject) => {
                req.on('data', (c) => chunks.push(Buffer.from(c)));
                req.on('end', () => resolve());
                req.on('error', reject);
              });
              const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf-8')) : {};
              //@ts-expect-error fix it later
              const nodemailer = (await import('nodemailer')).default;

              const smtpHost = 'smtp.gmail.com';
              const smtpPort = 587;
              const smtpSecure = false;
              const smtpUser = 'support@seeg-talentsource.com';
              const smtpPass = 'njev urja zsbc spfn';
              const from = 'One HCM - SEEG Talent Source <support@seeg-talentsource.com>';

              const { userEmail, firstName, lastName, sexe } = body || {};
              
              if (!userEmail || !firstName || !lastName) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Données manquantes' }));
                return;
              }

              const serif = ", Georgia, serif";
              const title = sexe === 'F' ? 'Madame' : 'Monsieur';

              const html = `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                  <tr>
                    <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
                      <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                        <tr>
                          <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                            <h2 style="color:#10b981; margin:20px 0 10px 0; font-size:20px;">✅ Votre Accès a été Validé !</h2>
                            <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${firstName} ${lastName}</strong>,</p>
                            <p style="margin:0 0 10px; font-size:16px;">Nous avons le plaisir de vous informer que votre demande d'accès à la plateforme <strong>OneHCM - SEEG Talent Source</strong> a été approuvée.</p>
                            <div style="background-color:#d1fae5; padding:20px; border-left:4px solid #10b981; margin:20px 0;">
                              <h3 style="color:#065f46; margin:0 0 15px 0; font-size:16px;">✅ Votre compte est maintenant actif</h3>
                              <p style="margin:5px 0; color:#065f46;">Vous pouvez dès maintenant vous connecter et commencer à postuler.</p>
                            </div>
                            <p style="margin:0 0 10px; font-size:16px;"><strong>Vos prochaines étapes :</strong></p>
                            <ul style="margin:0 0 10px; padding-left:20px; font-size:16px;">
                              <li style="margin:0 0 5px;">Connectez-vous avec votre email et mot de passe</li>
                              <li style="margin:0 0 5px;">Complétez votre profil candidat</li>
                              <li style="margin:0 0 5px;">Consultez les offres d'emploi</li>
                              <li style="margin:0 0 5px;">Postulez aux postes qui vous intéressent</li>
                            </ul>
                            <p style="margin:0 0 10px; font-size:16px;">Nous vous souhaitons bonne chance !</p>
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

              const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: { user: smtpUser, pass: smtpPass },
              });

              const info = await transporter.sendMail({
                from,
                to: userEmail,
                subject: '✅ Votre Accès à OneHCM a été Validé',
                html,
              });
              
              console.log('✅ [ACCESS APPROVED] Email envoyé via SMTP:', info?.messageId);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, messageId: info?.messageId }));
              return;
            } catch (e: any) {
              console.error('❌ [ACCESS APPROVED] Erreur:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
              return;
            }
          }
          next();
        });
      },
    },
    // Dev-only API: /api/send-access-rejected-email
    mode === 'development' && {
      name: 'dev-api-send-access-rejected-email',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/send-access-rejected-email') {
            try {
              const chunks: Buffer[] = [];
              await new Promise<void>((resolve, reject) => {
                req.on('data', (c) => chunks.push(Buffer.from(c)));
                req.on('end', () => resolve());
                req.on('error', reject);
              });
              const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf-8')) : {};
              //@ts-expect-error fix it later
              const nodemailer = (await import('nodemailer')).default;

              const smtpHost = 'smtp.gmail.com';
              const smtpPort = 587;
              const smtpSecure = false;
              const smtpUser = 'support@seeg-talentsource.com';
              const smtpPass = 'njev urja zsbc spfn';
              const from = 'One HCM - SEEG Talent Source <support@seeg-talentsource.com>';

              const { userEmail, firstName, lastName, sexe, reason } = body || {};
              
              if (!userEmail || !firstName || !lastName || !reason) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Données manquantes' }));
                return;
              }

              const serif = ", Georgia, serif";
              const title = sexe === 'F' ? 'Madame' : 'Monsieur';

              const html = `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                  <tr>
                    <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
                      <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                        <tr>
                          <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                            <h2 style="color:#dc2626; margin:20px 0 10px 0; font-size:20px;">Demande d'Accès Refusée</h2>
                            <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${firstName} ${lastName}</strong>,</p>
                            <p style="margin:0 0 10px; font-size:16px;">Nous vous informons que votre demande d'accès à la plateforme <strong>OneHCM - SEEG Talent Source</strong> n'a pas pu être validée.</p>
                            <div style="background-color:#fee2e2; padding:20px; border-left:4px solid #dc2626; margin:20px 0;">
                              <h3 style="color:#991b1b; margin:0 0 15px 0; font-size:16px;">Motif du refus</h3>
                              <p style="margin:0; color:#991b1b;">${reason}</p>
                            </div>
                            <p style="margin:0 0 10px; font-size:16px;">Si vous pensez qu'il s'agit d'une erreur, contactez notre support.</p>
                            <div style="background-color:#dbeafe; padding:15px; border-radius:5px; margin:20px 0;">
                              <p style="margin:0; color:#1e40af;"><strong>Contact Support :</strong> </br>
                              Email: support@seeg-talentsource.com </br>
                              Téléphone: +241 076402886
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

              const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: { user: smtpUser, pass: smtpPass },
              });

              const info = await transporter.sendMail({
                from,
                to: userEmail,
                subject: 'Demande d\'Accès Refusée - OneHCM',
                html,
              });
              
              console.log('✅ [ACCESS REJECTED] Email envoyé via SMTP:', info?.messageId);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, messageId: info?.messageId }));
              return;
            } catch (e: any) {
              console.error('❌ [ACCESS REJECTED] Erreur:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
              return;
            }
          }
          next();
        });
      },
    },
    // Dev-only middleware to avoid 404 on /favicon.ico by serving the SVG
    mode === 'development' && {
      name: 'serve-favicon-ico',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/favicon.ico') {
            try {
              const svgPath = path.resolve(__dirname, 'public', 'favicon.svg');
              const fs = await import('fs');
              const data = fs.readFileSync(svgPath);
              res.setHeader('Content-Type', 'image/svg+xml');
              res.statusCode = 200;
              res.end(data);
              return;
            } catch (e) {
              // Fall back to next handler if read fails
            }
          }
          next();
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
