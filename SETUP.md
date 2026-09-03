# JT Service — Mise en place de l'espace admin (Supabase + Cloudflare)

Ce guide vous fait passer d'un site statique à un site où vous pouvez
ajouter, modifier et supprimer des réalisations depuis votre navigateur,
sans toucher au code. Tout est gratuit (Supabase Free + Cloudflare Pages Free).

Comptez environ 20 minutes la première fois.

---

## Étape 1 — Créer le projet Supabase

1. Allez sur [supabase.com](https://supabase.com) → **Start your project** → créez un compte (gratuit).
2. **New project** :
   - Nom : `jt-service` (ou ce que vous voulez)
   - Mot de passe de la base de données : choisissez-en un solide et **notez-le quelque part** (vous n'en aurez pas besoin au quotidien, mais gardez-le).
   - Région : choisissez la plus proche (ex. Europe de l'Ouest).
3. Attendez 1 à 2 minutes que le projet soit prêt.

## Étape 2 — Créer la table des réalisations

1. Dans le menu de gauche : **SQL Editor** → **New query**.
2. Ouvrez le fichier `supabase/schema.sql` fourni avec le site, copiez tout son contenu, collez-le dans l'éditeur.
3. Cliquez **Run**. Vous devez voir "Success. No rows returned".

Cela crée :
- la table `projects` (vos réalisations)
- les règles de sécurité (le public ne peut que lire les réalisations publiées ; vous seul, une fois connecté, pouvez ajouter/modifier/supprimer)
- le stockage pour les photos

## Étape 3 — Vérifier le bucket de stockage des photos

1. Menu de gauche : **Storage**.
2. Vous devriez voir un bucket nommé **project-images**. S'il n'existe pas :
   - Cliquez **New bucket**
   - Nom exact : `project-images`
   - Activez **Public bucket**
   - Créez.

## Étape 4 — Créer votre compte admin

C'est le compte avec lequel vous vous connecterez sur `admin.html`. Les inscriptions publiques ne sont pas activées — seul vous pourrez créer des comptes.

1. Menu de gauche : **Authentication** → **Users** → **Add user** → **Create new user**.
2. Renseignez votre e-mail et un mot de passe.
3. Cochez **Auto Confirm User** (pour ne pas avoir besoin de valider par e-mail).
4. Créez.

Vous pourrez créer d'autres comptes admin plus tard de la même façon si besoin (par ex. pour un collègue).

## Étape 5 — Récupérer les clés du projet

1. Menu de gauche : **Project Settings** (icône d'engrenage) → **API**.
2. Notez deux valeurs :
   - **Project URL** (ressemble à `https://xxxxxxxx.supabase.co`)
   - **anon public** key (une longue chaîne de caractères)

⚠️ Ne prenez jamais la clé **service_role** — elle donne un accès total et ne doit jamais apparaître dans le code du site.

## Étape 6 — Configurer le site

1. Ouvrez le fichier `js/supabase-config.js` dans un éditeur de texte.
2. Remplacez :
   ```js
   const SUPABASE_URL = "https://VOTRE-PROJET.supabase.co";
   const SUPABASE_ANON_KEY = "VOTRE_CLE_ANON_PUBLIC";
   ```
   par vos vraies valeurs de l'étape 5.
3. Enregistrez.

## Étape 7 — Déployer sur Cloudflare Pages

1. Allez sur [pages.cloudflare.com](https://pages.cloudflare.com) → connectez-vous ou créez un compte gratuit.
2. **Create a project** → **Upload assets** (si vous n'utilisez pas Git) → glissez-déposez tout le dossier `jts-service` (ou son contenu).
3. Cloudflare vous donne une adresse du type `jts-service.pages.dev`. Vous pouvez ensuite y relier votre propre nom de domaine dans les réglages du projet (**Custom domains**).

Pour les mises à jour futures du **contenu** (textes, styles, nouvelles pages), il faudra redéployer le dossier. En revanche, ajouter/modifier une **réalisation** ne nécessite plus aucun redéploiement — ça passe uniquement par `admin.html` et Supabase.

## Étape 8 — Utiliser l'espace admin

1. Ouvrez `https://votre-site.pages.dev/admin.html`
2. Connectez-vous avec l'e-mail/mot de passe créés à l'étape 4.
3. Remplissez le formulaire (titre, catégorie, lieu, description, photo) → **Publier la réalisation**.
4. Elle apparaît immédiatement sur la page **Projets** du site, et dans l'aperçu de l'accueil si c'est l'une des 3 plus récentes.
5. Vous pouvez à tout moment **Modifier**, **Dépublier** (la masquer sans la supprimer) ou **Supprimer** une réalisation depuis la liste en bas de la page admin.

Le lien vers l'espace admin est aussi présent, en petit et discret, en bas de chaque page du site (pied de page).

---

## En cas de souci

- **La page projets.html est vide / rien ne s'affiche** : vérifiez `js/supabase-config.js` — les valeurs par défaut (`VOTRE-PROJET`, `VOTRE_CLE`) doivent bien avoir été remplacées.
- **"Connexion refusée" sur admin.html** : vérifiez l'e-mail/mot de passe, et que l'utilisateur a bien été créé avec "Auto Confirm User" coché à l'étape 4.
- **Une photo ne s'affiche pas** : vérifiez que le bucket `project-images` est bien en **Public** (Storage → project-images → Configuration).
- Tant que `js/supabase-config.js` n'est pas rempli, le site continue de fonctionner normalement avec son contenu actuel (rien ne casse) — l'espace admin affichera simplement un message vous invitant à le configurer.
