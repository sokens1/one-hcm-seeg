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
    port: 8082,
    proxy: {
      '/api/rh-eval': {
        target: 'https://rh-rval-api.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rh-eval/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
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

            const {
              to,
              candidateFullName,
              jobTitle,
              date,
              time,
              location,
              applicationId,
                candidateEmail,
                interviewType = 'entretien',
                interviewMode = 'presentiel',
                videoLink
            } = body || {};

            if (!candidateFullName || !jobTitle || !date || !time) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing fields: candidateFullName, jobTitle, date, time' }));
              return;
            }

            // Utilisation de "Monsieur/Madame" pour éviter les problèmes de détermination du sexe
            const title = 'Monsieur/Madame';
            const muniAccord = 'muni(e)';
            const dateObj = new Date(`${date}T${String(time).slice(0, 5)}`);
            const formattedDate = dateObj.toLocaleDateString('fr-FR');
            const formattedTime = String(time).slice(0, 5);
            const serif = ", Georgia, serif";
              
              // Déterminer si c'est une simulation ou un entretien
              const isSimulation = interviewType === 'simulation';
              const eventType = isSimulation ? 'simulation' : 'entretien de recrutement';
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
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                <tr>
                  <td align="left" style="padding:0;margin:0;text-align:left;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                      <tr>
                        <td align="left" style="padding:0;margin:0;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
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
               // Utilisation de "Monsieur/Madame" pour éviter les problèmes de détermination du sexe
               const title = 'Monsieur/Madame';
               
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
              // Utilisation de "Monsieur/Madame" pour éviter les problèmes de détermination du sexe
              const title = 'Monsieur/Madame';

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
    // Dev-only API: /api/send-rejection-email (email de rejet de candidature)
    mode === 'development' && {
      name: 'dev-api-send-rejection-email',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/send-rejection-email') {
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
              const { createClient } = await import('@supabase/supabase-js');

              const smtpHost = 'smtp.gmail.com';
              const smtpPort = 587;
              const smtpSecure = false;
              const smtpUser = 'support@seeg-talentsource.com';
              const smtpPass = 'njev urja zsbc spfn';
              const from = 'One HCM - SEEG Talent Source <support@seeg-talentsource.com>';

              const { to, candidateFullName, candidateEmail, jobTitle, applicationId } = body || {};
              
              if (!candidateFullName || !jobTitle) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing fields: candidateFullName, jobTitle' }));
                return;
              }

              // Utilisation de "Monsieur/Madame" pour éviter les problèmes de détermination du sexe
              const title = 'Monsieur/Madame';
              const serif = ", Georgia, serif";

              const html = `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                  <tr>
                    <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;">
                      <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 !important;padding:0 !important;">
                        <tr>
                          <td align="left" style="padding:0 !important;margin:0 !important;text-align:left;font-family: ui-serif${serif}; color:#000; font-size:16px; line-height:1.7;">
                            <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${candidateFullName}</strong>,</p>
                            <p style="margin:0 0 10px; font-size:16px;">Nous vous remercions pour l'intérêt que vous avez porté à rejoindre l'équipe dirigeante de la SEEG et pour le temps que vous avez consacré à votre candidature.</p>
                            <p style="margin:0 0 10px; font-size:16px;">Après un examen approfondi de celle-ci, nous sommes au regret de vous informer que votre profil n'a malheureusement pas été retenu pour le poste de <strong>${jobTitle}</strong> au sein de la SEEG.</p>
                            <p style="margin:0 0 10px; font-size:16px;">Nous vous souhaitons beaucoup de succès dans vos projets professionnels à venir et nous permettons de conserver votre dossier, au cas où une nouvelle opportunité en adéquation avec votre profil se présenterait.</p>
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

              const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: { user: smtpUser, pass: smtpPass },
              });

              const info = await transporter.sendMail({
                from,
                to: String(candidateEmail || to || smtpUser),
                subject: `Candidature au poste de ${jobTitle} – SEEG`,
                html,
              });
              
              console.log('✅ [REJECTION EMAIL] Email envoyé via SMTP:', info?.messageId);

              // Log dans email_logs
              try {
                const supabaseUrl = 'https://fyiitzndlqcnyluwkpqp.supabase.co';
                const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWl0em5kbHFjbnlsdXdrcHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDkxNTksImV4cCI6MjA3MTA4NTE1OX0.C3pTJmFapb9a2M6BLtb6AeKZX9SbkEikrosOIYJts9Q';
                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                await supabase.from('email_logs').insert({
                  to: String(candidateEmail || to || smtpUser),
                  subject: `Candidature au poste de ${jobTitle} – SEEG`,
                  html,
                  application_id: applicationId || null,
                  category: 'rejection',
                  provider_message_id: info?.messageId || null,
                  sent_at: new Date().toISOString(),
                });
              } catch (err) {
                console.log('[DEV API] insertion email_logs échouée (non bloquant):', err);
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, messageId: info?.messageId }));
              return;
            } catch (e: any) {
              console.error('❌ [REJECTION EMAIL] Erreur:', e);
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
    // Dev-only API: renvoi batch des emails d'entretien PRESENTIEL (LBV) d'après la liste fournie
    mode === 'development' && {
      name: 'dev-api-resend-presentiel',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/dev-resend-presentiel') {
            try {
              //@ts-expect-error dynamic import for dev
              const { createClient } = await import('@supabase/supabase-js');
              const supabaseUrl = 'https://fyiitzndlqcnyluwkpqp.supabase.co';
              const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWl0em5kbHFjbnlsdXdrcHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDkxNTksImV4cCI6MjA3MTA4NTE1OX0.C3pTJmFapb9a2M6BLtb6AeKZX9SbkEikrosOIYJts9Q';
              const supabase = createClient(supabaseUrl, supabaseAnonKey);

              // Liste complète initiale (présentiel LBV)
              const entriesAll = [
                // Présentiel (LBV) uniquement, exclus: Tristan EDOU BENGONE, Wilfrid NOUHANDO, ALBERIC BEKALE OBAME
                { nom: 'Souany Adamo Lyne', poste: 'Directeur Juridique, Communication & RSE', date: '11/3/2025', heure: '09h00' },
                { nom: 'Cendrine MBADINGA MBADINGA', poste: 'Directeur Juridique, Communication & RSE', date: '11/3/2025', heure: '10h00' },
                { nom: 'Charles ASSEMBE OVONO', poste: 'Directeur Juridique, Communication & RSE', date: '11/3/2025', heure: '11h00' },
                { nom: 'Fany Laetitia MILANG MANYANA', poste: 'Directeur Juridique, Communication & RSE', date: '11/3/2025', heure: '13h00' },
                { nom: 'Nick Venance TA', poste: 'Directeur Audit & Contrôle interne', date: '11/3/2025', heure: '14h00' },
                { nom: 'Brice Armand OKOLOGHO', poste: 'Directeur Audit & Contrôle interne', date: '11/4/2025', heure: '09h00' },
                { nom: 'Louis-Cédric DA-GRACA OKILI', poste: 'Directeur Audit & Contrôle interne', date: '11/4/2025', heure: '10h00' },
                { nom: 'Salomon Esnaut', poste: 'Directeur Audit & Contrôle interne', date: '11/4/2025', heure: '11h00' },
                { nom: 'Urielle OZOUAKI', poste: 'Directeur Audit & Contrôle interne', date: '11/5/2025', heure: '09h00' },
                { nom: 'Rodrigue Dick Léon RENOMBO', poste: 'Directeur Audit & Contrôle interne', date: '11/5/2025', heure: '10h00' },
                { nom: 'MILINGUI GLENN', poste: "Directeur des Systèmes d'Information", date: '11/5/2025', heure: '13h00' },
                { nom: 'MVE MEYE Patrick', poste: "Directeur des Systèmes d'Information", date: '11/5/2025', heure: '14h00' },
                { nom: 'MOUTETE Jean Marcel', poste: "Directeur des Systèmes d'Information", date: '11/6/2025', heure: '09h00' },
                { nom: 'SIMBA Didier', poste: "Directeur des Systèmes d'Information", date: '11/6/2025', heure: '10h00' },
                { nom: 'MBOUMBA OLAGO Andrei Laud', poste: "Directeur des Systèmes d'Information", date: '11/6/2025', heure: '11h00' },
                { nom: 'KOUMBA Jean Vital', poste: "Directeur des Systèmes d'Information", date: '11/6/2025', heure: '13h00' },
                { nom: 'MBOUMBA Simon', poste: "Directeur des Systèmes d'Information", date: '11/6/2025', heure: '14h00' },
                { nom: 'EYIH OBIANG Louis Eric Amédée', poste: "Directeur des Systèmes d'Information", date: '11/6/2025', heure: '15h00' },
              ];

              // Cible: uniquement les 5 restants à envoyer (en dur)
              const targets = new Set([
                'MILINGUI GLENN',
              ]);
              const entries = entriesAll.filter(e => targets.has(e.nom));

              const toYmd = (s: string) => {
                const p = s.split('/'); const m = p[0]; const d = p[1]; const y = p[2];
                return `${y}-${String(parseInt(m)).padStart(2, '0')}-${String(parseInt(d)).padStart(2, '0')}`;
              };
              const toHm = (s: string) => s.replace('h', ':').replace('H', ':');

              const results: Array<{nom: string; ok: boolean; reason?: string}> = [];
              for (const e of entries) {
                try {
                  const ymd = toYmd(e.date);
                  const hm = toHm(e.heure);
                  const iso = `${ymd}T${hm}:00`;

                  // 1) Recherche tolérante dans applications: toute la journée, filtre HH:MM et poste côté JS
                  const { data, error } = await supabase
                    .from('applications')
                    .select(`
                      id,
                      interview_date,
                      job_offers:job_offers!applications_job_offer_id_fkey(title),
                      users:users!applications_candidate_id_fkey(email, first_name, last_name)
                    `)
                    .gte('interview_date', `${ymd}T00:00:00`)
                    .lt('interview_date', `${ymd}T23:59:59`)
                    .limit(10);
                  if (error) throw error;
                  let match = (data || []).find((row: any) => {
                    // Filtre heure au format HH:MM
                    try {
                      const dt = new Date(row.interview_date);
                      const hh = String(dt.getHours()).padStart(2, '0');
                      const mm = String(dt.getMinutes()).padStart(2, '0');
                      const rowHm = `${hh}:${mm}`;
                      if (rowHm !== hm) return false;
                    } catch { return false; }
                    const rel = row.job_offers; const job = Array.isArray(rel) ? rel[0] : rel;
                    return (job?.title || '').trim().toLowerCase() === e.poste.trim().toLowerCase();
                  });

                  // 2) Fallback: si non trouvé, tenter via interview_slots (date+time séparées), puis joindre l'application
                  if (!match) {
                    const { data: slots, error: slotErr } = await supabase
                      .from('interview_slots')
                      .select('application_id, date, time, is_available')
                      .eq('date', ymd)
                      .eq('time', `${hm}:00`)
                      .eq('is_available', false)
                      .limit(5);
                    if (!slotErr && slots && slots.length > 0) {
                      const appId = slots[0].application_id;
                      if (appId) {
                        const { data: appRows } = await supabase
                          .from('applications')
                          .select(`
                            id,
                            interview_date,
                            job_offers:job_offers!applications_job_offer_id_fkey(title),
                            users:users!applications_candidate_id_fkey(email, first_name, last_name)
                          `)
                          .eq('id', appId)
                          .limit(1);
                        if (appRows && appRows.length > 0) {
                          const row = appRows[0];
                          const rel = row.job_offers; const job = Array.isArray(rel) ? rel[0] : rel;
                          if ((job?.title || '').trim().toLowerCase() === e.poste.trim().toLowerCase()) {
                            match = row;
                          }
                        }
                      }
                    }
                  }
                  if (!match) {
                    // Fallback forcé pour MILINGUI GLENN avec email connu
                    if (e.nom.toUpperCase().includes('MILINGUI') && e.nom.toUpperCase().includes('GLENN')) {
                      const body = JSON.stringify({
                        to: 'support@seeg-talentsource.com',
                        candidateFullName: 'Glenn MILINGUI',
                        candidateEmail: 'glennfresnel.milingui@gmail.com',
                        jobTitle: "Directeur des Systèmes d'Information",
                        date: ymd,
                        time: hm,
                        interviewType: 'entretien',
                        interviewMode: 'presentiel'
                      });
                      const resp = await fetch('http://localhost:8082/api/send-interview-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
                      if (!resp.ok) { results.push({ nom: e.nom, ok: false, reason: `HTTP ${resp.status}` }); continue; }
                      results.push({ nom: e.nom, ok: true });
                      await new Promise(r => setTimeout(r, 300));
                      continue;
                    }
                    results.push({ nom: e.nom, ok: false, reason: 'application introuvable' });
                    continue;
                  }
                  const usr = Array.isArray(match.users) ? match.users[0] : match.users;
                  const off = Array.isArray(match.job_offers) ? match.job_offers[0] : match.job_offers;
                  const body = JSON.stringify({
                    to: 'support@seeg-talentsource.com',
                    candidateFullName: `${usr?.first_name || ''} ${usr?.last_name || ''}`.trim(),
                    candidateEmail: usr?.email,
                    jobTitle: off?.title || 'Poste',
                    date: ymd,
                    time: hm,
                    applicationId: match.id,
                    interviewType: 'entretien',
                    interviewMode: 'presentiel'
                  });
                  let resp = await fetch('http://localhost:8082/api/send-interview-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
                  if (!resp.ok) {
                    // En cas d'échec réseau ponctuel, retenter une fois
                    try {
                      await new Promise(r => setTimeout(r, 400));
                      resp = await fetch('http://localhost:8082/api/send-interview-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
                    } catch {}
                  }
                  if (!resp.ok) { results.push({ nom: e.nom, ok: false, reason: `HTTP ${resp.status}` }); continue; }
                  results.push({ nom: e.nom, ok: true });
                  await new Promise(r => setTimeout(r, 300));
                } catch (err: any) {
                  results.push({ nom: e.nom, ok: false, reason: String(err?.message || err) });
                }
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, count: results.filter(r => r.ok).length, results }));
              return;
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: e?.message || 'Internal error' }));
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
              // Utilisation de "Monsieur/Madame" pour éviter les problèmes de détermination du sexe
              const title = 'Monsieur/Madame';

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
