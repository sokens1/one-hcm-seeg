# 🚀 Script de Déploiement Email - SEEG Talent Flow (PowerShell Corrigé)
# Ce script configure et déploie automatiquement le système d'envoi d'email

Write-Host "🚀 Configuration du système d'envoi d'email SEEG..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Configuration des secrets Supabase
Write-Host "📝 Configuration des secrets Supabase..." -ForegroundColor Yellow

# Clé API Resend
Write-Host "🔑 Configuration de la clé API Resend..." -ForegroundColor Cyan
$resendKey = "re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK"
supabase secrets set RESEND_API_KEY=$resendKey

# Email d'expédition (sans caractères spéciaux)
Write-Host "📧 Configuration de l'email d'expédition..." -ForegroundColor Cyan
$fromEmail = "SEEG Recrutement <support@seeg-talentsource.com>"
supabase secrets set FROM_EMAIL=$fromEmail

# Vérification de la configuration
Write-Host "✅ Vérification de la configuration..." -ForegroundColor Green
supabase secrets list

Write-Host ""
Write-Host "🚀 Déploiement de la fonction d'envoi d'email..." -ForegroundColor Yellow

# Déploiement de la fonction
supabase functions deploy send_application_confirmation

Write-Host ""
Write-Host "🔍 Vérification du déploiement..." -ForegroundColor Green
supabase functions list

Write-Host ""
Write-Host "📊 Affichage des logs de la fonction..." -ForegroundColor Yellow
Write-Host "Appuyez sur Ctrl+C pour arrêter l'affichage des logs" -ForegroundColor Gray
Write-Host ""

# Affichage des logs en temps réel
supabase functions logs send_application_confirmation --follow

Write-Host ""
Write-Host "🎉 Configuration terminée !" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "✅ Clé API Resend configurée" -ForegroundColor Green
Write-Host "✅ Email d'expédition configuré" -ForegroundColor Green
Write-Host "✅ Fonction déployée" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Pour tester : soumettez une candidature via le formulaire" -ForegroundColor Cyan
Write-Host "📧 Vérifiez que l'email de confirmation est reçu" -ForegroundColor Cyan
Write-Host "📊 Surveillez les logs : supabase functions logs send_application_confirmation" -ForegroundColor Cyan
Write-Host ""
Write-Host "📞 Support : support@seeg-talentsource.com | +241 076402886" -ForegroundColor Yellow
