# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b784f566-80bf-4316-a0eb-0a2d3b53c3eb

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b784f566-80bf-4316-a0eb-0a2d3b53c3eb) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b784f566-80bf-4316-a0eb-0a2d3b53c3eb) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

# SEEG HCM – Guide du projet

Ce projet est une application de recrutement SEEG (HCM) construite avec React + Vite + TypeScript + Tailwind + shadcn-ui, et Supabase pour l’authentification et la base de données.

## Sommaire
- Présentation rapide
- Prérequis
- Installation & démarrage
- Variables d’environnement
- Scripts disponibles
- Configuration Supabase (remote = source de vérité)
- Vérification du matricule (RPC) – flux d’inscription
- Déploiement des changements Supabase (SQL direct)
- Dépannage

## Présentation rapide
- Frontend dans `src/`
- Authentification par Supabase (email/password)
- Inscription côté UI: tous les champs requis. La suite du formulaire est déverrouillée uniquement si le matricule est validé côté serveur.
- Vérification matricule: se fait uniquement sur la colonne `matricule` (type BIGINT) via une RPC sécurisée `verify_matricule(p_matricule TEXT)`.

## Prérequis
- Node.js 18+
- npm ou bun (le projet fournit `package-lock.json` → npm recommandé)
- Accès à un projet Supabase (en ligne)

## Installation & démarrage
```bash
npm install
cp .env.example .env
# Renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env
npm run dev
```

## Variables d’environnement
Fichier: `.env`
- `VITE_SUPABASE_URL` (ex: `https://fyiitzndlqcnyluwkpqp.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` (clé anonyme du projet Supabase)

Ne commitez pas des secrets sensibles. `.env` est déjà ignoré par Git.

## Scripts disponibles
- `npm run dev`: lance le serveur de dev Vite
- `npm run build`: build production
- `npm run preview`: prévisualisation du build
- `npm run lint`: lint

## Configuration Supabase (remote = source de vérité)
- Nous utilisons Supabase en ligne comme source de vérité du schéma.
- Les migrations locales existent mais, pour éviter les divergences, nous appliquons les changements critiques via requêtes SQL directes sur le remote (voir plus bas).

## Vérification du matricule (RPC) – flux d’inscription
- Fichier front: `src/pages/Auth.tsx`
  - Fonction `verifyMatricule()` appelle `supabase.rpc('verify_matricule', { p_matricule })`.
  - Déclenchement automatique (debounce 500 ms) à la saisie du matricule.
  - Spinner d’attente (`Loader2`) et Card d’erreur en cas d’échec.
  - Tous les champs d’inscription sont requis; les champs après "Matricule" restent désactivés tant que la vérification n’est pas OK.
- RPC côté base: `public.verify_matricule(p_matricule TEXT) RETURNS boolean SECURITY DEFINER`
  - Implémentation compatible avec `seeg_agents.matricule` de type BIGINT.
  - Cast interne: `(p_matricule)::BIGINT`. Retourne `false` si la valeur n’est pas convertible.
  - Droits: `GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO anon;`
- SQL de référence dans le repo: `supabase/migrations/20250821174400_verify_matricule_cast_bigint.sql`

## Déploiement des changements Supabase (SQL direct)
Si vous ne gérez pas la DB locale et souhaitez appliquer uniquement la RPC côté remote:
1. Liez le projet au CLI (si vous avez un access token):
   ```bash
   supabase login   # si nécessaire
   supabase link --project-ref fyiitzndlqcnyluwkpqp
   ```
2. Exécutez uniquement le SQL RPC (sans pousser tout l’historique):
   ```bash
   supabase db query supabase/migrations/20250821174400_verify_matricule_cast_bigint.sql
   ```
3. Test rapide de la RPC:
   ```bash
   curl -s -X POST \
     'https://fyiitzndlqcnyluwkpqp.supabase.co/rest/v1/rpc/verify_matricule' \
     -H 'apikey: <VITE_SUPABASE_ANON_KEY>' \
     -H 'Content-Type: application/json' \
     -d '{"p_matricule": "4517"}'
   ```

## Dépannage
- Erreur "Remote migration versions not found": utilisez `supabase db pull` pour aligner le schéma local, ou `supabase db query <fichier.sql>` pour appliquer uniquement la RPC.
- Vérification matricule ne répond pas: testez la RPC via `curl` comme ci-dessus. Vérifiez la présence de la table `public.seeg_agents` et le type BIGINT de `matricule`.
- 401/403 côté RPC: vérifiez `VITE_SUPABASE_ANON_KEY` et les droits `GRANT EXECUTE` sur la fonction.



 <!-- {
   "source": "/((?!maintenance).*)",
   "destination": "/maintenance",
   "permanent": false
} -->