# 🚀 Script de Déploiement Email - Commandes Manuelles (PowerShell)
# Exécutez chaque commande une par une pour éviter les erreurs

Write-Host "🚀 Configuration Email SEEG - Commandes Manuelles" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Exécutez ces commandes une par une :" -ForegroundColor Yellow
Write-Host ""

# Étape 1
Write-Host "🔑 Étape 1 : Configurer la clé API Resend" -ForegroundColor Cyan
Write-Host "Copiez et collez cette commande :" -ForegroundColor White
Write-Host "supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK" -ForegroundColor Gray
Write-Host ""

# Étape 2
Write-Host "📧 Étape 2 : Configurer l'email d'expédition" -ForegroundColor Cyan
Write-Host "Copiez et collez cette commande :" -ForegroundColor White
Write-Host 'supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"' -ForegroundColor Gray
Write-Host ""

# Étape 3
Write-Host "✅ Étape 3 : Vérifier la configuration" -ForegroundColor Cyan
Write-Host "Copiez et collez cette commande :" -ForegroundColor White
Write-Host "supabase secrets list" -ForegroundColor Gray
Write-Host ""

# Étape 4
Write-Host "🚀 Étape 4 : Déployer la fonction" -ForegroundColor Cyan
Write-Host "Copiez et collez cette commande :" -ForegroundColor White
Write-Host "supabase functions deploy send_application_confirmation" -ForegroundColor Gray
Write-Host ""

# Étape 5
Write-Host "🔍 Étape 5 : Vérifier le déploiement" -ForegroundColor Cyan
Write-Host "Copiez et collez cette commande :" -ForegroundColor White
Write-Host "supabase functions list" -ForegroundColor Gray
Write-Host ""

# Étape 6
Write-Host "📊 Étape 6 : Voir les logs (optionnel)" -ForegroundColor Cyan
Write-Host "Copiez et collez cette commande :" -ForegroundColor White
Write-Host "supabase functions logs send_application_confirmation --since 1h" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 Après avoir exécuté toutes les commandes :" -ForegroundColor Green
Write-Host "1. Soumettez une candidature via le formulaire" -ForegroundColor White
Write-Host "2. Vérifiez que l'email de confirmation est reçu" -ForegroundColor White
Write-Host "3. Vérifiez votre dossier spam si nécessaire" -ForegroundColor White
Write-Host ""

Write-Host "📞 Support : support@seeg-talentsource.com | +241 076402886" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
Read-Host
