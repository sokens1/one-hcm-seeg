# Script pour corriger les problèmes dans public.application_drafts.csv

Write-Host "=== CORRECTION DU FICHIER public.application_drafts.csv ===" -ForegroundColor Green

$inputFile = "csv_exports/public.application_drafts.csv"
$outputFile = "csv_exports/public.application_drafts_clean.csv"

if (-not (Test-Path $inputFile)) {
    Write-Host "ERREUR: Le fichier $inputFile n'existe pas!" -ForegroundColor Red
    exit 1
}

Write-Host "Lecture du fichier original..." -ForegroundColor Yellow
$content = Get-Content $inputFile -Raw -Encoding UTF8

# Analyser les lignes
$lines = $content -split "`n"
$header = $lines[0]
$headerFields = $header -split ","
$expectedFields = $headerFields.Count

Write-Host "En-tête: $header" -ForegroundColor Cyan
Write-Host "Nombre de champs attendus: $expectedFields" -ForegroundColor Cyan

# Fonction pour échapper les champs CSV
function Escape-CsvField {
    param([string]$field)
    
    # Si le champ contient des virgules, des guillemets ou des retours à la ligne, l'entourer de guillemets
    if ($field -match '[,`"`n`r]') {
        # Échapper les guillemets existants en les doublant
        $escaped = $field -replace '"', '""'
        return '"' + $escaped + '"'
    }
    return $field
}

# Traiter chaque ligne
$cleanLines = @()
$problemLines = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i].Trim()
    
    if ($line -eq "") {
        continue
    }
    
    if ($i -eq 0) {
        # En-tête - pas de modification
        $cleanLines += $line
        continue
    }
    
    # Pour les lignes de données, utiliser une approche plus robuste
    # Diviser en champs en respectant les guillemets
    $fields = @()
    $currentField = ""
    $inQuotes = $false
    $j = 0
    
    while ($j -lt $line.Length) {
        $char = $line[$j]
        
        if ($char -eq '"') {
            if ($inQuotes -and $j + 1 -lt $line.Length -and $line[$j + 1] -eq '"') {
                # Guillemet échappé
                $currentField += '"'
                $j += 2
            } else {
                # Début ou fin de guillemets
                $inQuotes = -not $inQuotes
                $j++
            }
        } elseif ($char -eq ',' -and -not $inQuotes) {
            # Fin de champ
            $fields += $currentField
            $currentField = ""
            $j++
        } else {
            $currentField += $char
            $j++
        }
    }
    
    # Ajouter le dernier champ
    $fields += $currentField
    
    # Vérifier le nombre de champs
    if ($fields.Count -ne $expectedFields) {
        Write-Host "Ligne $($i+1): $($fields.Count) champs au lieu de $expectedFields" -ForegroundColor Red
        
        # Essayer de corriger en échappant les champs problématiques
        if ($fields.Count -gt $expectedFields) {
            # Trop de champs - probablement des virgules non échappées
            # Reconstruire la ligne en échappant correctement
            $correctedFields = @()
            $fieldIndex = 0
            
            # Prendre les premiers champs qui sont probablement corrects
            for ($k = 0; $k -lt $expectedFields - 1; $k++) {
                if ($fieldIndex -lt $fields.Count) {
                    $correctedFields += Escape-CsvField $fields[$fieldIndex]
                    $fieldIndex++
                }
            }
            
            # Le dernier champ doit contenir tout le reste
            $remainingContent = ""
            for ($k = $fieldIndex; $k -lt $fields.Count; $k++) {
                if ($remainingContent -ne "") {
                    $remainingContent += ","
                }
                $remainingContent += $fields[$k]
            }
            $correctedFields += Escape-CsvField $remainingContent
            
            $correctedLine = $correctedFields -join ","
            $cleanLines += $correctedLine
            
            Write-Host "  Ligne corrigée avec $($correctedFields.Count) champs" -ForegroundColor Yellow
        } else {
            # Pas assez de champs - ajouter des champs vides
            while ($fields.Count -lt $expectedFields) {
                $fields += ""
            }
            $cleanLines += ($fields -join ",")
            Write-Host "  Ligne corrigée avec $($fields.Count) champs" -ForegroundColor Yellow
        }
        
        $problemLines += "Ligne $($i+1)"
    } else {
        # Ligne correcte
        $cleanLines += $line
    }
}

# Sauvegarder le fichier nettoyé
Write-Host "Sauvegarde du fichier nettoyé..." -ForegroundColor Yellow
$cleanContent = $cleanLines -join "`n"
$cleanContent | Out-File -FilePath $outputFile -Encoding UTF8 -NoNewline

Write-Host "=== RÉSULTATS ===" -ForegroundColor Green
Write-Host "Fichier original: $inputFile" -ForegroundColor Cyan
Write-Host "Fichier nettoyé: $outputFile" -ForegroundColor Cyan
Write-Host "Lignes traitées: $($lines.Count)" -ForegroundColor Cyan
Write-Host "Lignes nettoyées: $($cleanLines.Count)" -ForegroundColor Cyan
Write-Host "Problèmes corrigés: $($problemLines.Count)" -ForegroundColor Cyan

if ($problemLines.Count -gt 0) {
    Write-Host "Lignes corrigées:" -ForegroundColor Yellow
    foreach ($problem in $problemLines) {
        Write-Host "  - $problem" -ForegroundColor Yellow
    }
}

Write-Host "✅ Fichier prêt pour l'import!" -ForegroundColor Green
Write-Host "=== FIN ===" -ForegroundColor Green
