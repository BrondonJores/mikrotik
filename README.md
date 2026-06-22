# BIYEM ASSI WIFI ZONE - Portail Hotspot MikroTik

Ce projet est un portail captif MikroTik pour la connexion par ticket ou compte membre.
Il contient les pages HTML attendues par RouterOS Hotspot, les styles, les scripts de
connexion CHAP/MD5, et un ancien module de slideshow publicitaire.

## Etat actuel

- Page principale: `login.html`
- Pages de session: `status.html`, `success.html`, `logout.html`, `expired.html`, `error.html`
- Styles principaux: `style.css`
- Slider existant: `engine1/`
- Assets marque: `assets/`, `img/`, `font/`
- Scripts et donnees: `md5.js`, `app.js`, `ads.json`

## Objectif de refonte

Transformer le portail en interface professionnelle, moderne et commerciale:

- Branding plus fort et coherent pour BIYEM ASSI WIFI ZONE
- Layout plus premium avec espace publicitaire / slideshow
- Parcours de connexion clair: Ticket et Membre
- Tarifs lisibles et faciles a modifier
- Pages secondaires alignees visuellement avec la page de connexion
- Experience mobile-first, rapide, accessible et compatible MikroTik

## Refonte UI en cours

La premiere passe de refonte est appliquee:

- `login.html` utilise maintenant un layout professionnel avec formulaire + slideshow publicitaire.
- `style.css` contient un design system plus sobre: couleurs, boutons, champs, panneaux et responsive.
- `app.js` gere le mode Ticket/Membre et le slideshow sans jQuery.
- `ads.json` centralise les publicites locales sans script tiers ni tracking externe.
- `status.html`, `success.html`, `logout.html`, `expired.html`, `error.html`, `alogin.html` et `radvert.html`
  sont harmonises avec le nouveau branding.
- Les imports Google Fonts et WOWSlider/jQuery ont ete retires des pages refondues.
- Les scripts inline des pages principales ont ete remplaces par `app.js`, avec une CSP meta restrictive.
- `terms.html` et `privacy.html` ajoutent les bases conditions/confidentialite du portail.
- Les captures de verification locales sont disponibles dans:
  - `ui-login-desktop.png`
  - `ui-login-mobile.png`
  - `ui-status-desktop.png`
  - `ui-login-secure-desktop.png`
  - `ui-login-secure-mobile.png`
  - `ui-login-json-desktop.png`
  - `ui-login-json-mobile.png`

## Documentation de travail

- [Diagnostic UI](docs/README-UI-AUDIT.md)
- [Roadmap de refonte](docs/README-REFONTE.md)
- [Architecture technique](docs/README-TECHNIQUE.md)
- [Branding et contenu](docs/README-BRANDING.md)
- [Securite et publicites](docs/README-SECURITE-PUBLICITES.md)

## Contraintes importantes

Les variables MikroTik comme `$(link-login-only)`, `$(username)`, `$(chap-id)`,
`$(chap-challenge)`, `$(link-orig)` et les blocs `$(if ...)` doivent rester compatibles
avec RouterOS. Toute refonte doit donc moderniser l'UI sans casser ces variables MikroTik.

## Lancement local

Le projet est statique, mais la page de connexion charge maintenant `ads.json`.
Pour voir les publicites JSON comme sur MikroTik, servir le dossier avec un serveur
local statique et ouvrir la page depuis `localhost`.

Exemple:

```powershell
python -m http.server 8765
```

Puis ouvrir `http://localhost:8765/login.html`.

## Prochaine etape conseillee

Faire la refonte en deux temps:

1. Stabiliser le socle: encodage UTF-8, variables de marque, structure HTML commune,
   nettoyage des styles et scripts inutilises.
2. Construire la nouvelle UI: layout responsive avec zone login + slideshow pub,
   nouvelles cartes tarifs, pages status/logout/success/error harmonisees.
