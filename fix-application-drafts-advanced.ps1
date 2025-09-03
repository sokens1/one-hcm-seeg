# Script avancé pour corriger les problèmes dans public.application_drafts.csv

Write-Host "=== CORRECTION AVANCÉE DU FICHIER public.application_drafts.csv ===" -ForegroundColor Green

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
    
    # Pour les lignes de données, utiliser une approche plus simple mais efficace
    # Diviser en champs en utilisant une approche basée sur la position des virgules
    # en tenant compte que les champs 3 et 4 (form_data et ui_state) contiennent du JSON
    
    # Trouver les positions des virgules qui séparent les champs
    $commaPositions = @()
    $inQuotes = $false
    $quoteCount = 0
    
    for ($j = 0; $j -lt $line.Length; $j++) {
        $char = $line[$j]
        
        if ($char -eq '"') {
            $quoteCount++
            if ($quoteCount % 2 -eq 1) {
                $inQuotes = $true
            } else {
                $inQuotes = $false
            }
        } elseif ($char -eq ',' -and -not $inQuotes) {
            $commaPositions += $j
        }
    }
    
    # Diviser la ligne en champs
    $fields = @()
    $startPos = 0
    
    foreach ($pos in $commaPositions) {
        $field = $line.Substring($startPos, $pos - $startPos)
        $fields += $field
        $startPos = $pos + 1
    }
    
    # Ajouter le dernier champ
    $lastField = $line.Substring($startPos)
    $fields += $lastField
    
    # Vérifier le nombre de champs
    if ($fields.Count -ne $expectedFields) {
        Write-Host "Ligne $($i+1): $($fields.Count) champs au lieu de $expectedFields" -ForegroundColor Red
        
        # Reconstruire la ligne avec les champs corrects
        $correctedFields = @()
        
        # Les premiers champs (user_id, job_offer_id) sont probablement corrects
        if ($fields.Count -ge 2) {
            $correctedFields += $fields[0]  # user_id
            $correctedFields += $fields[1]  # job_offer_id
        }
        
        # Le champ form_data doit contenir tout le JSON jusqu'au champ ui_state
        # Trouver où commence le champ ui_state (qui commence par {)
        $formDataStart = 2
        $uiStateStart = -1
        
        for ($k = $formDataStart; $k -lt $fields.Count; $k++) {
            if ($fields[$k] -match '^\s*\{.*activeTab.*currentStep') {
                $uiStateStart = $k
                break
            }
        }
        
        if ($uiStateStart -gt 0) {
            # Reconstruire form_data
            $formDataContent = ""
            for ($k = $formDataStart; $k -lt $uiStateStart; $k++) {
                if ($formDataContent -ne "") {
                    $formDataContent += ","
                }
                $formDataContent += $fields[$k]
            }
            $correctedFields += '"' + $formDataContent.Replace('"', '""') + '"'
            
            # Le champ ui_state
            $uiStateContent = ""
            for ($k = $uiStateStart; $k -lt $fields.Count - 1; $k++) {
                if ($uiStateContent -ne "") {
                    $uiStateContent += ","
                }
                $uiStateContent += $fields[$k]
            }
            $correctedFields += '"' + $uiStateContent.Replace('"', '""') + '"'
            
            # Le dernier champ (updated_at)
            $correctedFields += $fields[$fields.Count - 1]
        } else {
            # Approche de secours : tout mettre dans form_data
            $formDataContent = ""
            for ($k = 2; $k -lt $fields.Count - 1; $k++) {
                if ($formDataContent -ne "") {
                    $formDataContent += ","
                }
                $formDataContent += $fields[$k]
            }
            $correctedFields += '"' + $formDataContent.Replace('"', '""') + '"'
            $correctedFields += '""'  # ui_state vide
            $correctedFields += $fields[$fields.Count - 1]  # updated_at
        }
        
        $correctedLine = $correctedFields -join ","
        $cleanLines += $correctedLine
        
        Write-Host "  Ligne corrigée avec $($correctedFields.Count) champs" -ForegroundColor Yellow
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
