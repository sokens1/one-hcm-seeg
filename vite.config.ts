/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
            <div style="font-family: ui-serif${serif}; color:#000; max-width:760px; margin:0 auto; font-size:16px; line-height:1.7;">
              <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${candidateFullName}</strong>,</p>
              <p style="margin:0 0 10px; font-size:16px;">Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> a retenu notre attention.</p>
              <p style="margin:0 0 10px; font-size:16px;">Nous vous invitons à un entretien de recrutement qui se tiendra le&nbsp;:</p>
              <p style="margin:0 0 10px; font-size:16px;"><strong>Date :</strong> ${formattedDate}<br/>
              <strong>Heure :</strong> ${formattedTime}<br/>
              <strong>Lieu :</strong> ${location || "Salle de réunion du Président du Conseil d'Administration au 9ᵉ étage du siège de la SEEG sis à Libreville."}</p>
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
            <div style="font-family: ui-serif${serif}; color:#000; max-width:760px; margin:0 auto; font-size:16px; line-height:1.7;">
              <p style="margin:0 0 10px; font-size:16px;">${title} <strong>${candidateFullName}</strong>,</p>
              <p style="margin:0 0 10px; font-size:16px;">Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> a retenu notre attention.</p>
              <p style="margin:0 0 10px; font-size:16px;">Nous vous invitons à un entretien de recrutement qui se tiendra le&nbsp;:</p>
              <p style="margin:0 0 10px; font-size:16px;"><strong>Date :</strong> ${formattedDate}<br/>
              <strong>Heure :</strong> ${formattedTime}<br/>
              <strong>Lieu :</strong> ${location || "Salle de réunion du Président du Conseil d'Administration au 9ᵉ étage du siège de la SEEG sis à Libreville."}</p>
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
