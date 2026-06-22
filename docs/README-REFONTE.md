# Roadmap de refonte

## Etat actuel

Premiere passe implementee:

- Nouvelle page `login.html` avec zone connexion et panneau slideshow publicitaire.
- Nouveau `style.css` centralise.
- Nouveau `app.js` pour le mode Ticket/Membre et les publicites.
- Pages secondaires principales harmonisees.
- Verification desktop/mobile par captures locales.

Passe 21st Magic UI + UI Pro Max appliquee:

- Formulaire conserve en HTML statique, mais affine avec interactions type shadcn/Magic UI.
- Ajout du bouton afficher/masquer le mot de passe en mode membre.
- Ajout de micro-cartes de confiance sous le formulaire.
- Panneau publicitaire enrichi avec effet signal, grille subtile et offre mise en avant.
- Cartes tarifs plus premium avec labels commerciaux, tout en gardant les memes donnees.

Passe securite + publicites locales appliquee:

- Recommandations web documentees dans `docs/README-SECURITE-PUBLICITES.md`.
- Handlers inline retires des pages principales au profit de `app.js`.
- Connexion CHAP conservee avec hash MD5 local et decodage des tokens MikroTik echappes.
- Publicites configurees dans `ads.json`, avec fetch local uniquement, sans iframe, tracking ou script tiers.
- Pages `terms.html` et `privacy.html` ajoutees pour clarifier conditions et confidentialite.
- Captures `ui-login-secure-desktop.png` et `ui-login-secure-mobile.png` generees apres verification.

Passe JSON + UI premium appliquee:

- `ads.js` remplace par `ads.json`.
- `app.js` importe `ads.json`, valide les champs et conserve les slides HTML comme secours.
- `login.html` autorise uniquement `connect-src 'self'` pour le JSON local.
- Interface enrichie avec actions topbar, indicateurs de service, insights publicitaires et sections plus editoriales.
- Captures `ui-login-json-desktop.png` et `ui-login-json-mobile.png` generees en HTTP local.

## Phase 1 - Nettoyage du socle

- Convertir les pages en UTF-8 propre et corriger les textes casses.
- Centraliser le nom de marque: `BIYEM ASSI WIFI ZONE`.
- Supprimer les anciens textes hors marque: `BABA-IMANE`, `vue.net`, textes indonesiens.
- Retirer ou isoler les scripts inutilises (`service.js`, dependances Vue si non utilisees).
- Verifier que les variables MikroTik restent intactes.

## Phase 2 - Nouveau design system

- Definir les variables CSS de marque:
  - couleurs principales
  - surfaces
  - bordures
  - etats hover/focus
  - rayons
  - ombres
  - espacements
- Remplacer les emojis par des SVG ou icones CSS coherentes.
- Mettre en place des composants reutilisables:
  - bouton primaire
  - bouton secondaire
  - champ de formulaire
  - badge statut
  - carte tarif
  - panneau publicitaire

## Phase 3 - Page login professionnelle

Structure proposee:

- Header discret avec logo et nom de marque.
- Bloc login avec:
  - statut reseau
  - switch Ticket / Membre
  - input ticket ou login/mot de passe
  - bouton connexion
  - contact rapide
- Bloc publicitaire avec slideshow:
  - promotion du moment
  - avantages du Wi-Fi
  - contact/revendeur
  - offre longue duree
- Section tarifs lisible:
  - cartes ou grille responsive
  - prix en valeur forte
  - duree et validite claires

## Phase 4 - Slideshow publicitaire

Deux options:

- Option simple: slider CSS/JS maison, leger, facile a maintenir.
- Option heritage: reutiliser `engine1/` si les assets existants sont necessaires.

Recommendation: remplacer WOWSlider par un petit slider maison sans jQuery. Cela reduira
le poids, simplifiera la maintenance et donnera un meilleur controle responsive.

## Phase 5 - Pages secondaires

Refondre avec le meme design:

- `success.html`: confirmation claire + redirection status.
- `status.html`: tableau session modernise, donnees importantes en cartes.
- `logout.html`: resume session + bouton retour login.
- `expired.html`: message ticket expire + contact + retour login.
- `error.html`: erreur lisible, rassurante, avec lien de retour.

## Phase 6 - Verification

- Tester mobile 360px, 390px, 430px.
- Tester tablette et desktop.
- Verifier absence de scroll horizontal.
- Verifier lisibilite des tarifs.
- Verifier mode Ticket: password = username.
- Verifier mode Membre: password visible et editable.
- Verifier compatibilite avec variables MikroTik.

## Prochaines ameliorations conseillees

- Ajouter de vraies images publicitaires dans `assets/ads/` si la marque en dispose.
- Remplacer ou archiver les anciens fichiers inutilises apres test MikroTik reel:
  `engine1/`, `vue.min.js`, `service.js`, `toggle-theme.js`, `slider.css`.
- Tester directement sur RouterOS pour valider les blocs `$(if ...)` et les redirections.
