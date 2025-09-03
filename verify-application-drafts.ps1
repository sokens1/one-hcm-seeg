# Script pour vérifier le fichier public.application_drafts_clean.csv

Write-Host "=== VÉRIFICATION DU FICHIER public.application_drafts_clean.csv ===" -ForegroundColor Green

$inputFile = "csv_exports/public.application_drafts_clean.csv"

if (-not (Test-Path $inputFile)) {
    Write-Host "ERREUR: Le fichier $inputFile n'existe pas!" -ForegroundColor Red
    exit 1
}

Write-Host "Lecture du fichier..." -ForegroundColor Yellow
$content = Get-Content $inputFile -Raw -Encoding UTF8

# Analyser les lignes
$lines = $content -split "`n"
$header = $lines[0]
$headerFields = $header -split ","
$expectedFields = $headerFields.Count

Write-Host "En-tête: $header" -ForegroundColor Cyan
Write-Host "Nombre de champs attendus: $expectedFields" -ForegroundColor Cyan

# Vérifier chaque ligne
$problemLines = @()
$emptyLines = 0

for ($i = 1; $i -lt $lines.Count; $i++) {
    $line = $lines[$i].Trim()
    
    if ($line -eq "") {
        $emptyLines++
        continue
    }
    
    $fields = $line -split ","
    
    if ($fields.Count -ne $expectedFields) {
        $problemLines += "Ligne $($i+1): $($fields.Count) champs au lieu de $expectedFields"
    }
}

Write-Host "=== RÉSULTATS ===" -ForegroundColor Green
Write-Host "Lignes totales: $($lines.Count)" -ForegroundColor Cyan
Write-Host "Lignes vides: $emptyLines" -ForegroundColor Cyan
Write-Host "Problèmes de structure: $($problemLines.Count)" -ForegroundColor Cyan

if ($problemLines.Count -gt 0) {
    Write-Host "Problèmes détectés:" -ForegroundColor Red
    foreach ($problem in $problemLines) {
        Write-Host "  - $problem" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Aucun problème de structure détecté!" -ForegroundColor Green
}

Write-Host "=== FIN ===" -ForegroundColor Green
