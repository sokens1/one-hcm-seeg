const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(__dirname, '..', 'outputs');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'audit-report.md');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCandidatesFromJson(json, fileName) {
  // Many files are nested: { "Department Label": { "Candidate": { ... } } }
  // Detect first level department container
  const topKeys = Object.keys(json);
  let container = json;
  let departmentKey = topKeys.length === 1 && isObject(json[topKeys[0]]) ? topKeys[0] : null;
  if (departmentKey) {
    container = json[departmentKey];
  }

  const candidates = [];
  for (const candidateLabel of Object.keys(container)) {
    const candidateObj = container[candidateLabel];
    if (!isObject(candidateObj)) continue;

    // Try to detect poste from any section
    const mtp = candidateObj.mtp || (candidateObj.mtp && candidateObj.mtp['score MTP']) || null;
    const mtpSection = isObject(mtp) ? mtp : (isObject(candidateObj.mtp) ? candidateObj.mtp['score MTP'] : null);
    const conformite = candidateObj.conformite || (candidateObj.conformite && candidateObj.conformite['score de conformité']);
    const similarite = candidateObj.similarite_offre || candidateObj.completude || (candidateObj.completude && candidateObj.completude['score de complétude']);
    const resume = candidateObj.resume_global || candidateObj.global;
    const feedback = candidateObj.feedback;

    const poste = (mtpSection && mtpSection.poste) || (similarite && similarite.poste) || (resume && resume.poste) || null;

    candidates.push({
      fileName,
      department: departmentKey || 'ROOT',
      label: candidateLabel,
      poste: poste || 'Inconnu',
      sections: {
        conformite: isObject(conformite) && Object.keys(conformite).length > 0,
        completude: isObject(similarite) && Object.keys(similarite).length > 0,
        mtp: isObject(mtpSection) && Object.keys(mtpSection).length > 0,
        feedback: isObject(feedback) && Object.keys(feedback).length > 0,
        resume: isObject(resume) && Object.keys(resume).length > 0,
      },
    });
  }
  return candidates;
}

function main() {
  const jsonFiles = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.json'));
  const allCandidates = [];

  for (const file of jsonFiles) {
    try {
      const fp = path.join(PUBLIC_DIR, file);
      const json = readJson(fp);
      const candidates = extractCandidatesFromJson(json, file);
      allCandidates.push(...candidates);
    } catch (e) {
      console.error('Failed to read/parse', file, e.message);
    }
  }

  // Incomplete candidates: missing at least one of the five sections
  const incomplete = allCandidates.filter(c => {
    const s = c.sections;
    return !(s.resume && s.conformite && s.completude && s.mtp && s.feedback);
  });

  // Duplicates by normalized name and same poste (within all files)
  const byKey = new Map();
  for (const c of allCandidates) {
    const normalized = normalizeName(c.label);
    const posteKey = normalizeName(c.poste);
    const key = `${normalized}__${posteKey}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(c);
  }
  const duplicates = [];
  for (const [key, arr] of byKey.entries()) {
    if (arr.length > 1) duplicates.push(arr);
  }

  // Build report
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const lines = [];
  lines.push(`# Audit des JSON IA`);
  lines.push('');
  lines.push(`Date: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`Total fichiers analysés: ${jsonFiles.length}`);
  lines.push(`Total candidatures: ${allCandidates.length}`);
  lines.push('');

  lines.push('## Candidatures incomplètes (au moins une section manquante)');
  lines.push('');
  if (incomplete.length === 0) {
    lines.push('- Aucune');
  } else {
    // Group by file
    const byFile = new Map();
    for (const c of incomplete) {
      if (!byFile.has(c.fileName)) byFile.set(c.fileName, []);
      byFile.get(c.fileName).push(c);
    }
    for (const [file, arr] of [...byFile.entries()].sort()) {
      lines.push(`### ${file}`);
      for (const c of arr) {
        const missing = Object.entries(c.sections)
          .filter(([k, v]) => !v)
          .map(([k]) => k)
          .join(', ');
        lines.push(`- ${c.label} (poste: ${c.poste}) — manquant: ${missing || '—'}`);
      }
      lines.push('');
    }
  }

  lines.push('## Doublons (même nom et même poste)');
  lines.push('');
  if (duplicates.length === 0) {
    lines.push('- Aucun');
  } else {
    let i = 1;
    for (const group of duplicates) {
      const name = group[0].label;
      const poste = group[0].poste;
      lines.push(`### Groupe ${i}: ${name} — Poste: ${poste}`);
      for (const c of group) {
        lines.push(`- Fichier: ${c.fileName}, Département: ${c.department}`);
      }
      lines.push('');
      i++;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8');
  console.log('Audit terminé ->', OUTPUT_FILE);
}

main();



