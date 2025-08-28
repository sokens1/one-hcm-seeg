#!/bin/bash

# 🚀 Script de Déploiement Email - SEEG Talent Flow
# Ce script configure et déploie automatiquement le système d'envoi d'email

echo "🚀 Configuration du système d'envoi d'email SEEG..."
echo "=================================================="

# Configuration des secrets Supabase
echo "📝 Configuration des secrets Supabase..."

# Clé API Resend
echo "🔑 Configuration de la clé API Resend..."
supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK

# Email d'expédition
echo "📧 Configuration de l'email d'expédition..."
supabase secrets set FROM_EMAIL="SEEG Recrutement <support@seeg-talentsource.com>"

# Vérification de la configuration
echo "✅ Vérification de la configuration..."
supabase secrets list

echo ""
echo "🚀 Déploiement de la fonction d'envoi d'email..."

# Déploiement de la fonction
supabase functions deploy send_application_confirmation

echo ""
echo "🔍 Vérification du déploiement..."
supabase functions list

echo ""
echo "📊 Affichage des logs de la fonction..."
echo "Appuyez sur Ctrl+C pour arrêter l'affichage des logs"
echo ""

# Affichage des logs en temps réel
supabase functions logs send_application_confirmation --follow

echo ""
echo "🎉 Configuration terminée !"
echo "=================================================="
echo "✅ Clé API Resend configurée"
echo "✅ Email d'expédition configuré"
echo "✅ Fonction déployée"
echo ""
echo "🧪 Pour tester : soumettez une candidature via le formulaire"
echo "📧 Vérifiez que l'email de confirmation est reçu"
echo "📊 Surveillez les logs : supabase functions logs send_application_confirmation"
echo ""
echo "📞 Support : support@seeg-talentsource.com | +241 076402886"
