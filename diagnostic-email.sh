#!/bin/bash

# 🔍 Script de Diagnostic Email - SEEG Talent Flow
# Ce script diagnostique automatiquement les problèmes d'envoi d'email

echo "🔍 Diagnostic du système d'envoi d'email SEEG..."
echo "=================================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo -e "${BLUE}📋 Étape 1 : Vérification de la configuration Supabase...${NC}"

# Vérifier si Supabase CLI est installé
if command -v supabase &> /dev/null; then
    print_result 0 "Supabase CLI installé"
else
    print_result 1 "Supabase CLI non installé"
    echo "Installez-le avec : npm install -g supabase"
    exit 1
fi

# Vérifier la connexion Supabase
echo "🔐 Vérification de la connexion Supabase..."
if supabase status &> /dev/null; then
    print_result 0 "Connecté à Supabase"
else
    print_result 1 "Non connecté à Supabase"
    echo "Connectez-vous avec : supabase login"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Étape 2 : Vérification des secrets...${NC}"

# Vérifier les secrets
echo "🔑 Vérification de la clé API Resend..."
RESEND_KEY=$(supabase secrets list 2>/dev/null | grep RESEND_API_KEY | cut -d'=' -f2)

if [ -n "$RESEND_KEY" ]; then
    print_result 0 "Clé API Resend configurée"
    echo "   Clé : ${RESEND_KEY:0:10}..."
else
    print_result 1 "Clé API Resend non configurée"
    echo "   Configuration avec : supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK"
fi

echo "📧 Vérification de l'email d'expédition..."
FROM_EMAIL=$(supabase secrets list 2>/dev/null | grep FROM_EMAIL | cut -d'=' -f2)

if [ -n "$FROM_EMAIL" ]; then
    print_result 0 "Email d'expédition configuré"
    echo "   Email : $FROM_EMAIL"
else
    print_result 1 "Email d'expédition non configuré"
    echo "   Configuration avec : supabase secrets set FROM_EMAIL=\"SEEG Recrutement <support@seeg-talentsource.com>\""
fi

echo ""
echo -e "${BLUE}🚀 Étape 3 : Vérification des fonctions...${NC}"

# Vérifier les fonctions déployées
echo "🔍 Vérification de la fonction d'envoi d'email..."
FUNCTION_STATUS=$(supabase functions list 2>/dev/null | grep send_application_confirmation)

if [ -n "$FUNCTION_STATUS" ]; then
    print_result 0 "Fonction send_application_confirmation déployée"
    echo "   Statut : $FUNCTION_STATUS"
else
    print_result 1 "Fonction send_application_confirmation non déployée"
    echo "   Déploiement avec : supabase functions deploy send_application_confirmation"
fi

echo ""
echo -e "${BLUE}📊 Étape 4 : Vérification des logs...${NC}"

# Vérifier les logs récents
echo "📋 Récupération des logs récents..."
echo "   Logs des dernières 24h :"
supabase functions logs send_application_confirmation --since 24h 2>/dev/null | head -20

echo ""
echo -e "${BLUE}🧪 Étape 5 : Test de la fonction...${NC}"

# Demander l'email de test
echo -n "📧 Entrez votre email pour tester l'envoi : "
read TEST_EMAIL

if [ -n "$TEST_EMAIL" ]; then
    echo "🧪 Test d'envoi d'email..."
    
    # Test avec curl (si disponible)
    if command -v curl &> /dev/null; then
        echo "   Test avec curl..."
        # Note: L'URL exacte dépend de votre configuration Supabase
        echo "   Exécutez manuellement :"
        echo "   curl -X POST [VOTRE_URL_SUPABASE]/functions/v1/send_application_confirmation \\"
        echo "     -H \"Content-Type: application/json\" \\"
        echo "     -d '{\"to\": \"$TEST_EMAIL\", \"firstName\": \"Test\", \"jobTitle\": \"Test\"}'"
    else
        echo "   curl non disponible, test manuel requis"
    fi
fi

echo ""
echo -e "${BLUE}📋 Résumé du diagnostic...${NC}"

# Résumé des vérifications
echo "🔍 Résumé des vérifications :"
echo "   - Supabase CLI : $(command -v supabase &> /dev/null && echo "✅ Installé" || echo "❌ Non installé")"
echo "   - Connexion Supabase : $(supabase status &> /dev/null && echo "✅ Connecté" || echo "❌ Non connecté")"
echo "   - Clé API Resend : $(if [ -n "$RESEND_KEY" ]; then echo "✅ Configurée"; else echo "❌ Non configurée"; fi)"
echo "   - Email d'expédition : $(if [ -n "$FROM_EMAIL" ]; then echo "✅ Configuré"; else echo "❌ Non configuré"; fi)"
echo "   - Fonction déployée : $(if [ -n "$FUNCTION_STATUS" ]; then echo "✅ Déployée"; else echo "❌ Non déployée"; fi)"

echo ""
echo -e "${YELLOW}🚀 Solutions recommandées :${NC}"

if [ -z "$RESEND_KEY" ]; then
    echo "   1. Configurer la clé API : supabase secrets set RESEND_API_KEY=re_3HgzKBbW_Fu6zJZfuthDmfwXYys6bk4hK"
fi

if [ -z "$FROM_EMAIL" ]; then
    echo "   2. Configurer l'email : supabase secrets set FROM_EMAIL=\"SEEG Recrutement <support@seeg-talentsource.com>\""
fi

if [ -z "$FUNCTION_STATUS" ]; then
    echo "   3. Déployer la fonction : supabase functions deploy send_application_confirmation"
fi

echo ""
echo -e "${GREEN}🎯 Pour une solution automatique, exécutez : ./deploy-email.sh${NC}"
echo ""
echo "📞 Support : support@seeg-talentsource.com | +241 076402886"
