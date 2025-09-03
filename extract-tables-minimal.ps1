# Script minimal pour extraire les donnees des tables de la sauvegarde PostgreSQL vers des fichiers CSV
# Usage: .\extract-tables-minimal.ps1

param(
    [string]$BackupFile = "supabase\db_cluster-02-09-2025@22-16-06.backup",
    [string]$OutputDir = "csv_exports"
)

# Creer le dossier de sortie s'il n'existe pas
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force
}

Write-Host "Extraction des donnees des tables vers CSV..." -ForegroundColor Green

# Liste des tables principales
$Tables = @(
    "public.users",
    "public.seeg_agents", 
    "public.job_offers",
    "public.candidate_profiles",
    "public.applications",
    "public.application_drafts",
    "public.application_documents",
    "public.application_history",
    "public.documents",
    "public.interview_slots",
    "public.notifications",
    "public.protocol1_evaluations",
    "public.protocol2_evaluations"
)

# Fonction pour extraire les donnees d'une table
function Get-TableData {
    param(
        [string]$TableName,
        [string]$BackupFile,
        [string]$OutputDir
    )
    
    $OutputFile = "$OutputDir\$TableName.csv"
    
    Write-Host "Extraction de la table: $TableName" -ForegroundColor Yellow
    
    try {
        # Lire le fichier de sauvegarde ligne par ligne
        $Lines = Get-Content $BackupFile
        
        $InDataSection = $false
        $Columns = ""
        $DataLines = @()
        
        foreach ($Line in $Lines) {
            # Chercher la ligne COPY - utiliser une approche plus simple
            if ($Line.StartsWith("COPY $TableName")) {
                # Extraire les colonnes entre parentheses
                $StartIndex = $Line.IndexOf("(") + 1
                $EndIndex = $Line.IndexOf(") FROM stdin;")
                if ($StartIndex -gt 0 -and $EndIndex -gt $StartIndex) {
                    $Columns = $Line.Substring($StartIndex, $EndIndex - $StartIndex)
                    $InDataSection = $true
                    Write-Host "   Colonnes trouvees: $Columns" -ForegroundColor Cyan
                    continue
                }
            }
            
            # Si on est dans la section des donnees
            if ($InDataSection) {
                # Si on trouve la fin des donnees
                if ($Line -eq "\.") {
                    $InDataSection = $false
                    break
                }
                # Ajouter la ligne de donnees si elle n'est pas vide
                if ($Line.Trim() -ne "" -and $Line -ne "\.") {
                    $DataLines += $Line
                }
            }
        }
        
        if ($Columns -ne "") {
            # Creer le fichier CSV
            $CsvContent = @()
            $CsvContent += $Columns
            
            foreach ($DataLine in $DataLines) {
                $CsvContent += $DataLine
            }
            
            $CsvContent | Out-File -FilePath $OutputFile -Encoding UTF8
            Write-Host "   $($DataLines.Count) lignes exportees vers $OutputFile" -ForegroundColor Green
        } else {
            Write-Host "   Table $TableName non trouvee dans la sauvegarde" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   Erreur lors de l'extraction de $TableName : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Extraire les donnees de chaque table
foreach ($Table in $Tables) {
    Get-TableData -TableName $Table -BackupFile $BackupFile -OutputDir $OutputDir
}

# Creer un fichier d'ordre de creation des tables
$OrderFile = "$OutputDir\table_creation_order.txt"
Write-Host "`nCreation du fichier d'ordre de creation des tables..." -ForegroundColor Green

$OrderContent = @"
ORDRE DE CREATION DES TABLES - TALENT FLOW GABON
================================================

Cet ordre respecte les dependances entre les tables (cles etrangeres).

1. public.users (table de base pour tous les utilisateurs)
2. public.seeg_agents (agents SEEG - peut referencer users)
3. public.job_offers (offres d'emploi - peut referencer users pour recruiter_id)
4. public.candidate_profiles (profils candidats - reference users)
5. public.applications (candidatures - reference users et job_offers)
6. public.application_drafts (brouillons - reference users et job_offers)
7. public.application_documents (documents candidature - reference applications)
8. public.application_history (historique - reference applications)
9. public.documents (documents generaux - reference applications)
10. public.interview_slots (creneaux entretien - reference applications et users)
11. public.notifications (notifications - reference users et applications)
12. public.protocol1_evaluations (evaluations protocole 1 - reference applications)
13. public.protocol2_evaluations (evaluations protocole 2 - reference applications)

NOTES IMPORTANTES:
- Les tables auth.* sont gerees automatiquement par Supabase
- Les tables storage.* sont gerees automatiquement par Supabase Storage
- Les tables realtime.* sont gerees automatiquement par Supabase Realtime
- Les tables supabase_migrations.* sont gerees automatiquement par Supabase

DEPENDANCES PRINCIPALES:
- applications vers users (candidate_id), job_offers (job_offer_id)
- candidate_profiles vers users (user_id)
- application_documents vers applications (application_id)
- application_history vers applications (application_id)
- documents vers applications (application_id)
- interview_slots vers applications (application_id), users (candidate_id, recruiter_id)
- notifications vers users (user_id), applications (related_application_id)
- protocol1_evaluations vers applications (application_id)
- protocol2_evaluations vers applications (application_id)
"@

$OrderContent | Out-File -FilePath $OrderFile -Encoding UTF8

Write-Host "`nExtraction terminee!" -ForegroundColor Green
Write-Host "Fichiers crees dans le dossier: $OutputDir" -ForegroundColor Cyan
Write-Host "Ordre de creation des tables: $OrderFile" -ForegroundColor Cyan

# Afficher un resume
Write-Host "`nRESUME:" -ForegroundColor Magenta
if (Test-Path $OutputDir) {
    Get-ChildItem $OutputDir -Filter "*.csv" | ForEach-Object {
        $LineCount = (Get-Content $_.FullName | Measure-Object -Line).Lines - 1
        Write-Host "   $($_.Name): $LineCount lignes de donnees" -ForegroundColor White
    }
}
