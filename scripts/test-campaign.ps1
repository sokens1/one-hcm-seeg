# Script PowerShell pour tester la restriction de campagne
Write-Host "Test de la restriction de campagne - Talent Flow Gabon" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Verifier si Node.js est installe
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Verifier si les variables d'environnement sont definies
if (-not $env:VITE_SUPABASE_URL) {
    Write-Host "VITE_SUPABASE_URL n'est pas definie" -ForegroundColor Yellow
    Write-Host "Definissez-la avec: `$env:VITE_SUPABASE_URL='votre-url-supabase'" -ForegroundColor Yellow
}

if (-not $env:VITE_SUPABASE_ANON_KEY) {
    Write-Host "VITE_SUPABASE_ANON_KEY n'est pas definie" -ForegroundColor Yellow
    Write-Host "Definissez-la avec: `$env:VITE_SUPABASE_ANON_KEY='votre-cle-supabase'" -ForegroundColor Yellow
}

# Installer les dependances si necessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances..." -ForegroundColor Blue
    npm install
}

# Executer le script de test
Write-Host "Execution des tests..." -ForegroundColor Blue
node scripts/test-campaign-restriction.js

Write-Host "Tests termines!" -ForegroundColor Green
Write-Host "Verifiez les resultats ci-dessus pour vous assurer que tout fonctionne correctement." -ForegroundColor White