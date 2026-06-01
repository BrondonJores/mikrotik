# Securite, presentation SaaS statique et publicites

Ce fichier transforme les recherches web en checklist applicable au portail RICO'S WIFI ZONE.
Le projet reste statique et compatible MikroTik HotSpot, donc la strategie est de reduire les
risques cote navigateur sans ajouter de services externes.

## Sources consultees

- MikroTik HotSpot customisation: https://help.mikrotik.com/docs/spaces/ROS/pages/87162881/Hotspot%20customisation
- MikroTik HotSpot captive portal: https://help.mikrotik.com/docs/spaces/ROS/pages/56459266/HotSpot%2B-%2BCaptive%2Bportal
- MikroTik router hardening: https://help.mikrotik.com/docs/spaces/ROS/pages/328353/Securing%20your%20router
- MikroTik services: https://help.mikrotik.com/docs/spaces/ROS/pages/103841820/Services
- OWASP XSS Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/XSS_Prevention_Cheat_Sheet.html
- OWASP Content Security Policy Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- OWASP HTTP Headers Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- MDN CSP script-src: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src
- web.dev CLS: https://web.dev/articles/optimize-cls
- web.dev animations and performance: https://web.dev/articles/animations-and-performance
- EFF captive portals and privacy: https://www.eff.org/deeplinks/2017/08/how-captive-portals-interfere-wireless-security-and-privacy
- Wifirst captive portal compliance guide: https://www.wifirst.com/en/blog/wifi-captive-portal-compliance-guide
- MyWiFi captive portal UX notes: https://www.mywifinetworks.com/blog/captive-portal-design-ux-best-practices

## Decisions appliquees

- Publicites locales seulement: les annonces sont chargees depuis `ads.json` et des assets locaux.
- Aucun script tiers, iframe pub, pixel tracking ou CDN ajoute.
- Les handlers inline (`onclick`, `onSubmit`, `onLoad`) sont remplaces par des ecouteurs dans `app.js`.
- La logique CHAP/MD5 reste compatible: `md5.js` est local et les valeurs MikroTik sont lues depuis le DOM.
- Les textes dynamiques rendus par JavaScript passent par `textContent` au lieu de `innerHTML`.
- Une meta Content Security Policy est ajoutee aux pages principales.
- La page de connexion autorise `connect-src 'self'` uniquement pour importer `ads.json`.
- Les liens de confidentialite et conditions sont disponibles depuis la page de connexion.
- Les espaces publicitaires sont reserves visuellement pour eviter les decalages de layout.

## Regles publicitaires

- Formats autorises: `.webp`, `.jpg`, `.jpeg`, `.png`.
- Dossier conseille: `assets/ads/`.
- Ne pas utiliser de SVG fourni par un annonceur externe.
- Ne pas coller de script annonceur, iframe, tag analytics, pixel ou code de tracking.
- Redimensionner les visuels avant depot: idealement moins de 250 Ko par image.
- Garder un texte court: titre, description, prix/offre, libelle secondaire.

## Format `ads.json`

Le fichier accepte un objet avec une cle `ads` contenant 1 a 5 annonces. Les champs
non conformes sont ignores ou remplaces par une valeur sure.

```json
{
  "version": 1,
  "updatedAt": "2026-05-16",
  "ads": [
    {
      "active": true,
      "theme": "wifi",
      "eyebrow": "Offre populaire",
      "title": "Internet rapide des 500 FCFA",
      "description": "Connexion stable en quelques secondes.",
      "price": "500 FCFA",
      "meta": "3 jours / 72 heures",
      "cta": "Assistance",
      "href": "tel:+2250141965069",
      "image": "assets/ads/offre-wifi.webp",
      "imageAlt": "Offre Wi-Fi RICO"
    }
  ]
}
```

Champs optionnels:

- `startsAt` et `expiresAt`: dates ISO pour programmer une campagne.
- `theme`: `wifi`, `premium`, `sponsor` ou `support`.
- `image`: image locale uniquement dans `assets/ads/`.

## Limites et recommandations MikroTik

- Preferer `http-chap` au minimum; utiliser HTTPS HotSpot avec certificat si l'environnement le permet.
- Eviter `http-pap` quand c'est possible, car il expose le mot de passe en clair sur HTTP.
- Desactiver les services routeur inutiles et restreindre Winbox/SSH/WWW aux IP d'administration.
- Isoler les clients Wi-Fi entre eux quand le materiel et la configuration le permettent.
- Servir les pages sans dependances externes pour garder le portail rapide et fiable avant authentification.

## Headers a ajouter si le portail passe par un serveur/proxy

MikroTik HotSpot sert surtout des fichiers statiques. Si un proxy ou serveur web est place devant,
ajouter aussi ces headers HTTP:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
