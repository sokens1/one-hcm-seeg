# Script de diagnostic complet pour le système d'email
# Exécutez ce script pour identifier tous les problèmes potentiels

Write-Host "🔍 DIAGNOSTIC COMPLET DU SYSTÈME D'EMAIL" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérification de Supabase CLI
Write-Host "1️⃣ Vérification de Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI installé: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non installé ou non accessible" -ForegroundColor Red
    Write-Host "   Installez-le via: npm install -g supabase" -ForegroundColor Red
    exit 1
}

# 2. Vérification de la connexion au projet
Write-Host ""
Write-Host "2️⃣ Vérification de la connexion au projet..." -ForegroundColor Yellow
try {
    $projectStatus = supabase status
    Write-Host "✅ Projet Supabase connecté" -ForegroundColor Green
} catch {
    Write-Host "❌ Projet Supabase non connecté" -ForegroundColor Red
    Write-Host "   Vérifiez que vous êtes dans le bon répertoire" -ForegroundColor Red
}

# 3. Vérification des secrets
Write-Host ""
Write-Host "3️⃣ Vérification des secrets Supabase..." -ForegroundColor Yellow
try {
    $secrets = supabase secrets list
    Write-Host "✅ Secrets récupérés:" -ForegroundColor Green
    
    if ($secrets -match "RESEND_API_KEY") {
        Write-Host "   ✅ RESEND_API_KEY configuré" -ForegroundColor Green
    } else {
        Write-Host "   ❌ RESEND_API_KEY manquant" -ForegroundColor Red
    }
    
    if ($secrets -match "FROM_EMAIL") {
        Write-Host "   ✅ FROM_EMAIL configuré" -ForegroundColor Green
    } else {
        Write-Host "   ❌ FROM_EMAIL manquant" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Impossible de récupérer les secrets" -ForegroundColor Red
}

# 4. Vérification des fonctions
Write-Host ""
Write-Host "4️⃣ Vérification des fonctions Supabase..." -ForegroundColor Yellow
try {
    $functions = supabase functions list
    Write-Host "✅ Fonctions récupérées:" -ForegroundColor Green
    
    if ($functions -match "send_application_confirmation") {
        Write-Host "   ✅ send_application_confirmation active" -ForegroundColor Green
    } else {
        Write-Host "   ❌ send_application_confirmation inactive" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Impossible de récupérer les fonctions" -ForegroundColor Red
}

# 5. Test de la fonction directement
Write-Host ""
Write-Host "5️⃣ Test direct de la fonction d'email..." -ForegroundColor Yellow
Write-Host "   Envoi d'un email de test..." -ForegroundColor Gray

$testPayload = @{
    to = "test@example.com"
    firstName = "Test"
    jobTitle = "Test Poste"
    applicationId = "TEST-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
} | ConvertTo-Json

try {
    $testResult = supabase functions invoke send_application_confirmation --body $testPayload
    Write-Host "✅ Test de fonction réussi" -ForegroundColor Green
    Write-Host "   Réponse: $testResult" -ForegroundColor Gray
} catch {
    Write-Host "❌ Test de fonction échoué" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Vérification des logs récents
Write-Host ""
Write-Host "6️⃣ Vérification des logs récents..." -ForegroundColor Yellow
try {
    Write-Host "   Récupération des logs de la dernière heure..." -ForegroundColor Gray
    $logs = supabase functions logs send_application_confirmation --since 1h
    if ($logs) {
        Write-Host "✅ Logs disponibles:" -ForegroundColor Green
        Write-Host $logs -ForegroundColor Gray
    } else {
        Write-Host "ℹ️ Aucun log récent trouvé" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Impossible de récupérer les logs" -ForegroundColor Red
}

# 7. Vérification de la configuration Resend
Write-Host ""
Write-Host "7️⃣ Vérification de la configuration Resend..." -ForegroundColor Yellow
Write-Host "   Vérifiez manuellement:" -ForegroundColor Gray
Write-Host "   - Votre clé API est valide sur https://resend.com/emails" -ForegroundColor Gray
Write-Host "   - Votre domaine est configuré et vérifié" -ForegroundColor Gray
Write-Host "   - Votre compte n'est pas en mode test" -ForegroundColor Gray

# 8. Recommandations
Write-Host ""
Write-Host "8️⃣ RECOMMANDATIONS" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

Write-Host "📧 Pour tester l'email:" -ForegroundColor Yellow
Write-Host "   1. Allez sur votre page d'accueil" -ForegroundColor White
Write-Host "   2. Utilisez la section 'Test d'Envoi d'Email'" -ForegroundColor White
Write-Host "   3. Entrez votre email personnel" -ForegroundColor White
Write-Host "   4. Cliquez sur 'Envoyer l'Email de Test'" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Si l'email ne fonctionne toujours pas:" -ForegroundColor Yellow
Write-Host "   1. Vérifiez vos logs Supabase" -ForegroundColor White
Write-Host "   2. Testez votre clé API Resend directement" -ForegroundColor White
Write-Host "   3. Vérifiez votre dossier spam" -ForegroundColor White
Write-Host "   4. Contactez le support Resend si nécessaire" -ForegroundColor White

Write-Host ""
Write-Host "🎯 DIAGNOSTIC TERMINÉ" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Testez maintenant l'email depuis votre page d'accueil !" -ForegroundColor Green
