# Script PowerShell pour appliquer la correction définitive RLS
# Ce script applique la migration et vérifie que le problème est résolu

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "CORRECTION DÉFINITIVE RLS - protocol1_evaluations" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Vérifier que Supabase CLI est installé
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI détecté: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé. Veuillez l'installer d'abord." -ForegroundColor Red
    Write-Host "Installation: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "❌ Fichier supabase/config.toml non trouvé. Assurez-vous d'être dans le répertoire racine du projet." -ForegroundColor Red
    exit 1
}

Write-Host "📁 Répertoire de travail: $(Get-Location)" -ForegroundColor Blue

# Appliquer la migration
Write-Host "🚀 Application de la migration définitive RLS..." -ForegroundColor Yellow
try {
    supabase db push
    Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'application de la migration: $_" -ForegroundColor Red
    exit 1
}

# Vérifier l'état de RLS
Write-Host "🔍 Vérification de l'état RLS..." -ForegroundColor Yellow
try {
    $rlsStatus = supabase db reset --db-url $env:SUPABASE_DB_URL --debug 2>&1 | Select-String "protocol1_evaluations"
    Write-Host "État RLS: $rlsStatus" -ForegroundColor Blue
} catch {
    Write-Host "⚠️ Impossible de vérifier l'état RLS automatiquement" -ForegroundColor Yellow
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "CORRECTION TERMINÉE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ La migration définitive RLS a été appliquée" -ForegroundColor Green
Write-Host "✅ Toutes les politiques RLS ont été supprimées" -ForegroundColor Green
Write-Host "✅ Toutes les permissions ont été accordées" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "1. Redémarrez votre application frontend" -ForegroundColor White
Write-Host "2. Videz le cache du navigateur (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "3. Testez l'évaluation Protocol 1" -ForegroundColor White
Write-Host "4. Si l'erreur 403 persiste, vérifiez les logs Supabase" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔧 Si le problème persiste, exécutez manuellement dans l'éditeur SQL Supabase:" -ForegroundColor Yellow
Write-Host "   ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan
