# Masquage de la campagne 2 sur la vue publique après le 21/10

## 🎯 Objectif

Masquer les offres de la campagne 2 sur la vue publique (visiteurs non connectés) après le 21 octobre 2025, tout en continuant à les afficher pour les candidats connectés.

## ✅ Logique implémentée

### Vue Publique (visiteurs non connectés)
- ❌ **Campagne 1** : Toujours masquée (historique)
- ✅ **Campagne 2** : Visible jusqu'au **21/10/2025 23:59:59**
- ❌ **Campagne 2** : Masquée à partir du **22/10/2025 00:00:00**
- ✅ **Campagne 3** : Toujours visible

### Vue Candidat (utilisateurs connectés)
- ❌ **Campagne 1** : Toujours masquée (historique)
- ✅ **Campagne 2** : Toujours visible (même après le 21/10)
- ✅ **Campagne 3** : Toujours visible

### Vue Recruteur/Admin
- ✅ **Toutes les campagnes** : Toujours visibles (1, 2, 3)

## 📋 Filtrage en cascade

Les offres sont filtrées dans l'ordre suivant :

1. **Statut** : active uniquement (pas de brouillons)
2. **Statut candidat** : interne/externe (pour les candidats connectés)
3. **Campagne** : selon les règles ci-dessus
4. **Date limite** : masquer les offres dont la `date_limite` est dépassée (sauf recruteurs)

## 🔍 Exemples de scénarios

### Scénario 1 : Visiteur public le 20/10/2025
- ✅ Voit les offres de la campagne 2
- ✅ Voit les offres de la campagne 3

### Scénario 2 : Visiteur public le 22/10/2025
- ❌ Ne voit plus les offres de la campagne 2
- ✅ Voit les offres de la campagne 3

### Scénario 3 : Candidat connecté le 22/10/2025
- ✅ Voit les offres de la campagne 2 (selon son statut interne/externe)
- ✅ Voit les offres de la campagne 3 (selon son statut interne/externe)

### Scénario 4 : Recruteur le 22/10/2025
- ✅ Voit TOUTES les offres (campagnes 1, 2, 3)

## 🚀 Fichier modifié

- `src/hooks/useJobOffers.tsx` (lignes 266-298)

## 📝 Date clé

**21 octobre 2025 23:59:59** = Date après laquelle la campagne 2 est masquée pour le public

