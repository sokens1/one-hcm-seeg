// Usage (Node 18+):
// 1) Exportez votre Excel en CSV avec les colonnes suivantes et l'entête EXACTE:
//    Passage,N° Ordre,Candidat,Poste,Date entretien,Heure entretien,Localisation,Observations sur dossier
// 2) Placez le fichier à la racine ou indiquez le chemin en argument
//    node scripts/resend_presentiel_interviews.js interviews_29.csv
// 3) Variables d'environnement requises:
//    SUPABASE_URL, SUPABASE_ANON_KEY (lecture), API_BASE (ex: https://www.seeg-talentsource.com)
//
// Le script:
// - Filtre uniquement Localisation = "LBV" (présentiel)
// - Convertit la date (ex: 11/3/2025) en YYYY-MM-DD et l'heure (ex: 09h00) en HH:MM
// - Retrouve l'application par interview_date et (si possible) par poste
// - Récupère l'email du candidat
// - Renvoie l'email via /api/send-interview-email

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const API_BASE = process.env.API_BASE || 'https://www.seeg-talentsource.com';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Veuillez définir SUPABASE_URL et SUPABASE_ANON_KEY dans les variables d\'environnement.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    // Gestion basique des virgules: si votre CSV contient des virgules dans le texte,
    // exportez en CSV avec guillemets ou nettoyez-les avant.
    const cols = raw.split(',');
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = (cols[idx] || '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

function toYmd(dateStr) {
  // Attend MM/DD/YYYY ou M/D/YYYY ou DD/MM/YYYY selon Excel local
  // D'après les données: "11/3/2025" => 2025-11-03 (M/D/YYYY)
  const parts = dateStr.split('/').map(p => p.trim());
  if (parts.length !== 3) return null;
  const [m, d, y] = parts; // M/D/Y
  const mm = String(parseInt(m, 10)).padStart(2, '0');
  const dd = String(parseInt(d, 10)).padStart(2, '0');
  const yyyy = String(parseInt(y, 10));
  return `${yyyy}-${mm}-${dd}`;
}

function toHm(timeStr) {
  // "09h00" => "09:00"
  const t = timeStr.replace('h', ':').replace('H', ':').trim();
  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hh = String(parseInt(match[1], 10)).padStart(2, '0');
  const mm = String(parseInt(match[2], 10)).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function findApplicationByInterviewAndPoste(ymd, hm, poste) {
  const iso = `${ymd}T${hm}:00`;
  // On récupère par date exacte, puis on filtre par poste côté JS si besoin
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      interview_date,
      job_offers:job_offers!applications_job_offer_id_fkey(title),
      users:users!applications_candidate_id_fkey(email, first_name, last_name)
    `)
    .eq('interview_date', iso)
    .limit(10);
  if (error) throw error;
  if (!data || data.length === 0) return null;
  // Filtrer par titre si possible
  const filtered = data.filter(row => {
    const rel = row.job_offers;
    const job = Array.isArray(rel) ? rel[0] : rel;
    return (job?.title || '').trim().toLowerCase() === (poste || '').trim().toLowerCase();
  });
  return (filtered[0] || data[0]) || null;
}

async function sendInterviewEmail(appRow, ymd, hm) {
  const usr = Array.isArray(appRow.users) ? appRow.users[0] : appRow.users;
  const off = Array.isArray(appRow.job_offers) ? appRow.job_offers[0] : appRow.job_offers;
  const candidateEmail = usr?.email;
  const candidateFullName = `${usr?.first_name || ''} ${usr?.last_name || ''}`.trim();
  const jobTitle = off?.title || 'Poste';

  const payload = {
    to: 'support@seeg-talentsource.com',
    candidateFullName,
    candidateEmail,
    jobTitle,
    date: ymd,
    time: hm,
    applicationId: appRow.id,
    interviewType: 'entretien',
    interviewMode: 'presentiel'
  };

  const resp = await fetch(`${API_BASE}/api/send-interview-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`HTTP ${resp.status} ${txt}`);
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  try {
    const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('interviews_29.csv');
    if (!fs.existsSync(csvPath)) {
      console.error(`Fichier CSV introuvable: ${csvPath}`);
      process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCsv(content);
    const presentiel = rows.filter(r => (r['Localisation'] || '').trim().toUpperCase() === 'LBV');

    let sent = 0, notFound = 0, failed = 0;
    for (const r of presentiel) {
      const ymd = toYmd(r['Date entretien']);
      const hm = toHm(r['Heure entretien']);
      const poste = r['Poste'];
      const nomPrenom = r['Candidat'];
      if (!ymd || !hm) {
        console.warn(`⏭️ Ignoré (date/heure invalide): ${nomPrenom} ${r['Date entretien']} ${r['Heure entretien']}`);
        continue;
      }

      try {
        const app = await findApplicationByInterviewAndPoste(ymd, hm, poste);
        if (!app) {
          console.warn(`❓ Application introuvable pour ${nomPrenom} | ${poste} | ${ymd} ${hm}`);
          notFound++;
          continue;
        }

        await sendInterviewEmail(app, ymd, hm);
        console.log(`✅ Email renvoyé: ${nomPrenom} | ${poste} | ${ymd} ${hm}`);
        sent++;
      } catch (e) {
        console.error(`❌ Échec envoi: ${nomPrenom} | ${poste} | ${ymd} ${hm} ->`, e.message);
        failed++;
      }
      await sleep(400); // throttle
    }

    console.log(`\nRésultat: envoyés=${sent}, introuvables=${notFound}, échecs=${failed}`);
  } catch (e) {
    console.error('Erreur inattendue:', e);
    process.exit(1);
  }
})();


