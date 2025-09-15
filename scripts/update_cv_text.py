import argparse
import csv
import sys
from pathlib import Path

CSV_PATH = Path(__file__).resolve().parents[1] / 'documents' / 'cv_extraction.csv'


def sanitize_for_csv(text: str) -> str:
    if text is None:
        return ''
    # Remplacer virgules par des espaces, normaliser espaces et nouvelles lignes
    cleaned = text.replace(',', ' ')
    cleaned = cleaned.replace('\r', ' ').replace('\n', ' ')
    # Collapser les espaces multiples
    cleaned = ' '.join(cleaned.split())
    return cleaned.strip()


def load_rows(path: Path):
    with open(path, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        header = reader.fieldnames or []
    return header, rows


def save_rows(path: Path, header, rows):
    # Écriture en UTF-8 avec BOM pour rester compatible si nécessaire
    with open(path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=header, extrasaction='ignore')
        writer.writeheader()
        for r in rows:
            writer.writerow(r)


def find_row_index(rows, candidate_id: str = None, candidate_name: str = None, job_offer_id: str = None):
    matches = []
    for idx, r in enumerate(rows):
        ok = True
        if candidate_id is not None:
            ok = ok and (str(r.get('candidate_id', '')).strip() == str(candidate_id).strip())
        if candidate_name is not None:
            ok = ok and (str(r.get('candidate_name', '')).strip() == str(candidate_name).strip())
        if job_offer_id is not None:
            ok = ok and (str(r.get('job_offer_id', '')).strip() == str(job_offer_id).strip())
        if ok:
            matches.append(idx)
    return matches


def main():
    p = argparse.ArgumentParser(description='Mettre à jour la colonne cv_text pour un candidat dans cv_extraction.csv')
    g = p.add_mutually_exclusive_group(required=False)
    g.add_argument('--candidate-id', dest='candidate_id', help='Identifiant unique du candidat')
    p.add_argument('--candidate-name', dest='candidate_name', help='Nom affiché du candidat (si pas de candidate-id)')
    p.add_argument('--job-offer-id', dest='job_offer_id', help='ID de l\'offre (pour disambiguïser)')

    src = p.add_mutually_exclusive_group(required=False)
    src.add_argument('--text', dest='text', help='Texte du CV à injecter (sera nettoyé)')
    src.add_argument('--text-file', dest='text_file', help='Chemin d\'un fichier texte contenant le CV')

    p.add_argument('--csv', dest='csv_path', default=str(CSV_PATH), help='Chemin vers le CSV (par défaut documents/cv_extraction.csv)')

    args = p.parse_args()

    if not (args.candidate_id or args.candidate_name):
        p.error('Spécifiez --candidate-id ou --candidate-name (avec --job-offer-id si nécessaire).')

    # Obtenir le texte à injecter
    if args.text is not None:
        raw = args.text
    elif args.text_file is not None:
        raw = Path(args.text_file).read_text(encoding='utf-8')
    else:
        # Lire depuis stdin (permet collage multi-lignes). Terminer par Ctrl+Z puis Entrée (PowerShell)
        raw = sys.stdin.read()

    cleaned = sanitize_for_csv(raw)

    csv_path = Path(args.csv_path)
    header, rows = load_rows(csv_path)

    # S'assurer que les colonnes existent
    required = ['candidate_name', 'job_title', 'cv_text', 'job_offer_id', 'candidate_id']
    for col in required:
        if col not in header:
            header.append(col)
            for r in rows:
                r.setdefault(col, '')

    matches = find_row_index(rows, args.candidate_id, args.candidate_name, args.job_offer_id)

    if len(matches) == 0:
        print('Aucun enregistrement correspondant trouvé.', file=sys.stderr)
        sys.exit(2)
    if len(matches) > 1 and not args.candidate_id:
        print(f'{len(matches)} enregistrements correspondent. Précisez --candidate-id ou ajoutez --job-offer-id.', file=sys.stderr)
        sys.exit(3)

    # Si plusieurs mais candidate_id fourni, on les met à jour tous (cas rare de doublon) sinon un seul
    target_indexes = matches if args.candidate_id and len(matches) > 1 else [matches[0]]

    for idx in target_indexes:
        rows[idx]['cv_text'] = cleaned

    save_rows(csv_path, header, rows)
    print(f'Mis à jour {len(target_indexes)} enregistrement(s) dans {csv_path.as_posix()}')


if __name__ == '__main__':
    main()
