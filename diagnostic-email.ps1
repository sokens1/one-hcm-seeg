# 🔍 Script de Diagnostic Email - SEEG Talent Flow (PowerShell)
# Ce script diagnostique automatiquement les problèmes d'envoi d'email

Write-Host "🔍 Diagnostic du système d'envoi d'email SEEG..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Fonction pour afficher les résultats
function Write-Result {
    param(
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

Write-Host "📋 Étape 1 : Vérification de la configuration Supabase..." -ForegroundColor Blue

# Vérifier si Supabase CLI est installé
try {
    $supabaseVersion = supabase --version 2>$null
    if ($supabaseVersion) {
        Write-Result $true "Supabase CLI installé"
        Write-Host "   Version : $supabaseVersion" -ForegroundColor Gray
    } else {
        Write-Result $false "Supabase CLI non installé"
        Write-Host "Installez-le avec : npm install -g supabase" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Result $false "Supabase CLI non installé"
    Write-Host "Installez-le avec : npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Vérifier la connexion Supabase
Write-Host "🔐 Vérification de la connexion Supabase..." -ForegroundColor Cyan
try {
    $status = supabase status 2>$null
    if ($status) {
        Write-Result $true "Connecté à Supabase"
    } else {
        Write-Result $false "Non connecté à Supabase"
        Write-Host "Connectez-vous avec : supabase login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Result $false "Non connecté à Supabase"
    Write-Host "Connectez-vous avec : supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Étape 2 : Vérification des secrets..." -ForegroundColor Blue

# Vérifier les secrets
Write-Host "🔑 Vérification de la clé API Resend..." -ForegroundColor Cyan
try {
    $secrets = supabase secrets list 2>$null
    $resendKey = $secrets | Select-String "RESEND_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1] }
    
    if ($resendKey) {
        Write-Result $true "Clé API Resend configurée"
        Write-Host "   Clé : $($resendKey.Substring(0, [Math]::Min(10, $resendKey.Length)))..." -ForegroundColor Gray
    } else {
        Write-Result $false "Clé API Resend non configurée"
        Write-Host "   Configuration avec : supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK" -ForegroundColor Yellow
    }
} catch {
    Write-Result $false "Impossible de vérifier les secrets"
}

Write-Host "📧 Vérification de l'email d'expédition..." -ForegroundColor Cyan
try {
    $fromEmail = $secrets | Select-String "FROM_EMAIL" | ForEach-Object { $_.ToString().Split('=')[1] }
    
    if ($fromEmail) {
        Write-Result $true "Email d'expédition configuré"
        Write-Host "   Email : $fromEmail" -ForegroundColor Gray
    } else {
        Write-Result $false "Email d'expédition non configuré"
        Write-Host "   Configuration avec : supabase secrets set FROM_EMAIL=`"SEEG Recrutement <support@seeg-talentsource.com>`"" -ForegroundColor Yellow
    }
} catch {
    Write-Result $false "Impossible de vérifier l'email d'expédition"
}

Write-Host ""
Write-Host "🚀 Étape 3 : Vérification des fonctions..." -ForegroundColor Blue

# Vérifier les fonctions déployées
Write-Host "🔍 Vérification de la fonction d'envoi d'email..." -ForegroundColor Cyan
try {
    $functions = supabase functions list 2>$null
    $functionStatus = $functions | Select-String "send_application_confirmation"
    
    if ($functionStatus) {
        Write-Result $true "Fonction send_application_confirmation déployée"
        Write-Host "   Statut : $functionStatus" -ForegroundColor Gray
    } else {
        Write-Result $false "Fonction send_application_confirmation non déployée"
        Write-Host "   Déploiement avec : supabase functions deploy send_application_confirmation" -ForegroundColor Yellow
    }
} catch {
    Write-Result $false "Impossible de vérifier les fonctions"
}

Write-Host ""
Write-Host "📊 Étape 4 : Vérification des logs..." -ForegroundColor Blue

# Vérifier les logs récents
Write-Host "📋 Récupération des logs récents..." -ForegroundColor Cyan
Write-Host "   Logs des dernières 24h :" -ForegroundColor Gray
try {
    $logs = supabase functions logs send_application_confirmation --since 24h 2>$null
    if ($logs) {
        $logs | Select-Object -First 20 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "   Aucun log trouvé" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Impossible de récupérer les logs" -ForegroundColor Red
}

Write-Host ""
Write-Host "🧪 Étape 5 : Test de la fonction..." -ForegroundColor Blue

# Demander l'email de test
$testEmail = Read-Host "📧 Entrez votre email pour tester l'envoi"

if ($testEmail) {
    Write-Host "🧪 Test d'envoi d'email..." -ForegroundColor Cyan
    
    # Test avec Invoke-WebRequest (PowerShell natif)
    Write-Host "   Test avec PowerShell..." -ForegroundColor Gray
    Write-Host "   Exécutez manuellement :" -ForegroundColor Yellow
    Write-Host "   Invoke-WebRequest -Uri '[VOTRE_URL_SUPABASE]/functions/v1/send_application_confirmation' -Method POST -ContentType 'application/json' -Body '{\"to\": \"$testEmail\", \"firstName\": \"Test\", \"jobTitle\": \"Test\"}'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 Résumé du diagnostic..." -ForegroundColor Blue

# Résumé des vérifications
Write-Host "🔍 Résumé des vérifications :" -ForegroundColor Cyan
Write-Host "   - Supabase CLI : $(if (Get-Command supabase -ErrorAction SilentlyContinue) { '✅ Installé' } else { '❌ Non installé' })" -ForegroundColor Gray
Write-Host "   - Connexion Supabase : $(if ($status) { '✅ Connecté' } else { '❌ Non connecté' })" -ForegroundColor Gray
Write-Host "   - Clé API Resend : $(if ($resendKey) { '✅ Configurée' } else { '❌ Non configurée' })" -ForegroundColor Gray
Write-Host "   - Email d'expédition : $(if ($fromEmail) { '✅ Configuré' } else { '❌ Non configuré' })" -ForegroundColor Gray
Write-Host "   - Fonction déployée : $(if ($functionStatus) { '✅ Déployée' } else { '❌ Non déployée' })" -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 Solutions recommandées :" -ForegroundColor Yellow

if (-not $resendKey) {
    Write-Host "   1. Configurer la clé API : supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK" -ForegroundColor Yellow
}

if (-not $fromEmail) {
    Write-Host "   2. Configurer l'email : supabase secrets set FROM_EMAIL=`"SEEG Recrutement <support@seeg-talentsource.com>`"" -ForegroundColor Yellow
}

if (-not $functionStatus) {
    Write-Host "   3. Déployer la fonction : supabase functions deploy send_application_confirmation" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Pour une solution automatique, exécutez : .\deploy-email.ps1" -ForegroundColor Green
Write-Host ""
Write-Host "📞 Support : support@seeg-talentsource.com | +241 076402886" -ForegroundColor Cyan
