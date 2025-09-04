# Script pour corriger les violations de clé étrangère dans public.application_documents.csv

Write-Host "=== CORRECTION DES CLÉS ÉTRANGÈRES DANS public.application_documents.csv ===" -ForegroundColor Green

$applicationsFile = "csv_exports/public.applications.csv"
$documentsFile = "csv_exports/public.application_documents.csv"
$outputFile = "csv_exports/public.application_documents_clean.csv"

if (-not (Test-Path $applicationsFile)) {
    Write-Host "ERREUR: Le fichier $applicationsFile n'existe pas!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $documentsFile)) {
    Write-Host "ERREUR: Le fichier $documentsFile n'existe pas!" -ForegroundColor Red
    exit 1
}

Write-Host "Lecture des fichiers..." -ForegroundColor Yellow

# Lire les applications valides
$applicationsContent = Get-Content $applicationsFile -Raw -Encoding UTF8
$applicationsLines = $applicationsContent -split "`n"
$validApplicationIds = @{}

# Extraire les IDs des applications valides (première colonne)
for ($i = 1; $i -lt $applicationsLines.Count; $i++) {
    $line = $applicationsLines[$i].Trim()
    if ($line -ne "") {
        $fields = $line -split ","
        if ($fields.Count -gt 0) {
            $appId = $fields[0].Trim()
            if ($appId -ne "") {
                $validApplicationIds[$appId] = $true
            }
        }
    }
}

Write-Host "Applications valides trouvées: $($validApplicationIds.Count)" -ForegroundColor Cyan

# Lire les documents
$documentsContent = Get-Content $documentsFile -Raw -Encoding UTF8
$documentsLines = $documentsContent -split "`n"
$header = $documentsLines[0]

Write-Host "En-tête des documents: $header" -ForegroundColor Cyan

# Traiter chaque ligne de documents
$cleanLines = @()
$invalidLines = @()
$validLines = 0

for ($i = 0; $i -lt $documentsLines.Count; $i++) {
    $line = $documentsLines[$i].Trim()
    
    if ($line -eq "") {
        continue
    }
    
    if ($i -eq 0) {
        # En-tête
        $cleanLines += $line
        continue
    }
    
    # Diviser la ligne en champs
    $fields = $line -split ","
    
    if ($fields.Count -ge 2) {
        $applicationId = $fields[1].Trim()
        
        if ($validApplicationIds.ContainsKey($applicationId)) {
            # Application ID valide
            $cleanLines += $line
            $validLines++
        } else {
            # Application ID invalide
            $invalidLines += "Ligne $($i+1): Application ID '$applicationId' n'existe pas"
            Write-Host "Ligne $($i+1): Application ID '$applicationId' invalide" -ForegroundColor Red
        }
    } else {
        # Ligne malformée
        $invalidLines += "Ligne $($i+1): Format incorrect"
        Write-Host "Ligne $($i+1): Format incorrect" -ForegroundColor Red
    }
}

# Sauvegarder le fichier nettoyé
Write-Host "Sauvegarde du fichier nettoyé..." -ForegroundColor Yellow
$cleanContent = $cleanLines -join "`n"
$cleanContent | Out-File -FilePath $outputFile -Encoding UTF8 -NoNewline

Write-Host "=== RÉSULTATS ===" -ForegroundColor Green
Write-Host "Fichier applications: $applicationsFile" -ForegroundColor Cyan
Write-Host "Fichier documents original: $documentsFile" -ForegroundColor Cyan
Write-Host "Fichier documents nettoyé: $outputFile" -ForegroundColor Cyan
Write-Host "Lignes totales dans documents: $($documentsLines.Count)" -ForegroundColor Cyan
Write-Host "Lignes valides conservées: $validLines" -ForegroundColor Cyan
Write-Host "Lignes supprimées (clés étrangères invalides): $($invalidLines.Count)" -ForegroundColor Cyan

if ($invalidLines.Count -gt 0) {
    Write-Host "Lignes supprimées:" -ForegroundColor Yellow
    foreach ($invalid in $invalidLines) {
        Write-Host "  - $invalid" -ForegroundColor Yellow
    }
}

Write-Host "✅ Fichier prêt pour l'import!" -ForegroundColor Green
Write-Host "=== FIN ===" -ForegroundColor Green
