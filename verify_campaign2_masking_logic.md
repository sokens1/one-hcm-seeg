# 🔍 Vérification de la logique de masquage Campagne 2

## ❌ Problème identifié

Les offres de la campagne 2 ont été **désactivées** (statut `'inactive'`) au lieu d'être **masquées** par la logique de filtrage automatique.

## ✅ Solution

### 1. Remettre les offres en statut 'active'

```sql
-- Remettre toutes les offres de la campagne 2 en statut 'active'
UPDATE job_offers 
SET status = 'active', updated_at = now()
WHERE campaign_id = 2 
  AND status != 'active';
```

### 2. La logique de masquage automatique fonctionne déjà

Dans `src/hooks/useJobOffers.tsx` (lignes 268-276) :

```typescript
// VUE PUBLIQUE : Masquer campagne 2 après le 21/10/2025
if (offerCampaignId === 2) {
  const now = new Date();
  const campaign2EndDate = new Date('2025-10-21T23:59:59');
  if (now > campaign2EndDate) {
    return false; // ❌ Masquée pour le public
  }
}
```

## 📊 Comportement attendu

### Avant le 22/10/2025 00:00:00
- **Public** : ✅ Voit les offres de la campagne 2
- **Candidats connectés** : ✅ Voient les offres de la campagne 2
- **Recruteurs** : ✅ Voient toutes les offres

### Après le 22/10/2025 00:00:00
- **Public** : ❌ Ne voit plus les offres de la campagne 2 (masquées)
- **Candidats connectés** : ✅ Voient encore les offres de la campagne 2
- **Recruteurs** : ✅ Voient toutes les offres

## 🎯 Différence entre masquage et désactivation

| Méthode | Statut DB | Vue Public | Vue Candidat | Vue Recruteur |
|---------|-----------|------------|--------------|---------------|
| **Désactivation** | `'inactive'` | ❌ Masqué | ❌ Masqué | ✅ Visible |
| **Masquage logique** | `'active'` | ❌ Masqué* | ✅ Visible | ✅ Visible |

*Masqué seulement après le 21/10/2025 pour le public

## 🚀 Action requise

1. Exécuter le script SQL pour remettre les offres en `'active'`
2. Vérifier que la logique de masquage fonctionne correctement
3. Les offres seront automatiquement masquées pour le public après le 21/10/2025
