# Script PowerShell pour exécuter la correction des candidatures refusées
# Ce script charge les variables d'environnement et exécute le script Node.js

Write-Host "🔧 Script de correction des candidatures refusées" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le fichier .env existe
$envFile = "..\.env"
if (Test-Path $envFile) {
    Write-Host "✅ Fichier .env trouvé" -ForegroundColor Green
    
    # Charger les variables d'environnement
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✅ Variables d'environnement chargées" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier .env non trouvé dans le répertoire parent" -ForegroundColor Red
    Write-Host "Veuillez créer un fichier .env avec les variables Supabase" -ForegroundColor Yellow
    exit 1
}

# Vérifier les variables d'environnement requises
$requiredVars = @("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Variables d'environnement manquantes:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    exit 1
}

Write-Host "✅ Toutes les variables d'environnement sont présentes" -ForegroundColor Green

# Exécuter le script Node.js
Write-Host "`n🚀 Exécution du script de correction..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

try {
    node fix-rejected-candidates.js
    Write-Host "`n✅ Script exécuté avec succès" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Erreur lors de l'exécution du script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Correction terminée!" -ForegroundColor Green
