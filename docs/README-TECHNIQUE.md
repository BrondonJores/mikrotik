# Architecture technique

## Type de projet

Projet statique HTML/CSS/JavaScript pour portail captif MikroTik Hotspot.
Il ne depend pas d'un build system comme Vite, Webpack ou Next.js.

## Fichiers principaux

- `login.html`: page de connexion principale.
- `status.html`: page de statut session.
- `success.html`: page affichee apres connexion.
- `logout.html`: page de deconnexion.
- `expired.html`: ticket expire.
- `error.html`: erreur MikroTik.
- `style.css`: feuille principale.
- `app.js`: interactions UI de la nouvelle refonte.
- `md5.js`: hash MD5 pour CHAP MikroTik.
- `engine1/`: ancien moteur de slideshow WOWSlider + jQuery.

## Logique MikroTik a conserver

Dans `login.html`, la connexion utilise:

- `form[name="sendin"]`
- `form[name="login"]`
- `doLogin()`
- `hexMD5('$(chap-id)' + password + '$(chap-challenge)')`
- `$(link-login-only)`
- `$(link-orig)`
- `$(if chap-id) ... $(endif)`

Ces elements sont sensibles. La refonte peut changer le HTML visuel, mais doit garder
la logique de soumission.

## Risques techniques detectes

- Encodage visiblement casse dans plusieurs fichiers.
- Imports Google Fonts externes, fragiles sur portail captif.
- `status.html` tente d'acceder a `document.getElementById('exp')` alors que l'iframe
  est commente.
- `success.html` tente d'acceder a `dname`, mais aucun element avec cet id n'existe.
- `service.js` depend d'API externes probablement obsoletes ou bloquees.
- `vue.min.js` est present, mais ne semble pas necessaire a la page principale actuelle.
- WOWSlider ajoute du poids et depend de jQuery.

## Recommandations techniques

- Garder le projet sans build pour faciliter l'installation sur MikroTik.
- Utiliser une seule feuille `style.css` bien structuree.
- Ajouter un petit `app.js` si besoin pour le theme, le mode login et le slider.
- Eviter les CDN et ressources externes.
- Optimiser les images publicitaires en WebP/JPG compresse.
- Garder les scripts simples et compatibles navigateurs anciens raisonnables.

## Etat technique apres premiere passe

- Le nouveau slider publicitaire ne depend plus de jQuery.
- Les pages refondues ne chargent plus Google Fonts.
- `app.js` est charge uniquement par `login.html`.
- Les fichiers legacy sont encore presents pour securiser la transition, mais ne sont plus appeles
  par les pages principales refondues.

## Convention conseillee

Structure cible possible:

```text
assets/
  brand/
  ads/
  icons/
css/
  legacy.css
engine1/
docs/
login.html
status.html
success.html
logout.html
expired.html
error.html
style.css
app.js
md5.js
README.md
```

On peut garder les anciens fichiers pendant la transition, puis supprimer ce qui est
confirme inutile apres verification.
