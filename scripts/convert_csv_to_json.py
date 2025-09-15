import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / 'documents' / 'cv_extraction.csv'
OUT_DIR = ROOT / 'documents' / 'json_extraction'
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_PATH = OUT_DIR / 'cv_extraction.json'

REQUIRED_KEYS = ['candidate_name', 'job_title', 'cv_text', 'job_offer_id', 'candidate_id']

rows = []
with open(CSV_PATH, 'r', encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f)
    for row in reader:
        normalized = {k: (row.get(k, '') or '') for k in REQUIRED_KEYS}
        for k, v in row.items():
            if k not in normalized:
                normalized[k] = v if v is not None else ''
        rows.append(normalized)

with open(OUT_PATH, 'w', encoding='utf-8') as out:
    json.dump(rows, out, ensure_ascii=False, indent=2)

print(f'Wrote {len(rows)} records to {OUT_PATH.as_posix()}')
