# Diagnostic UI

## Impression generale

Le site a deja une intention visuelle: fond sombre, glassmorphism, toggle jour/nuit,
badge reseau actif, carte de connexion et tarifs. Mais l'ensemble ressemble encore a
un template modifie plutot qu'a une marque professionnelle. La page est centree sur une
seule carte, alors que le besoin demande un portail plus commercial avec publicites,
meilleur branding et experience plus moderne.

## Points forts

- La logique MikroTik de connexion est deja presente.
- Le mode Ticket / Membre existe et peut etre conserve.
- Le theme jour/nuit est une bonne base si on le rend plus discret.
- Les tarifs sont deja dans la page et peuvent devenir une vraie section commerciale.
- Le dossier `engine1/` contient deja un moteur de slider utilisable ou remplacable.

## Problemes actuels

- Le branding est incoherent: `BIYEM ASSI WIFI ZONE`, `BABA-IMANE`, `vue.net` et anciens
  textes indonesiens coexistent dans plusieurs pages.
- Plusieurs textes sont mal encodes dans les sources, par exemple les accents et icones
  apparaissent comme caracteres casses.
- La page principale ne contient pas de vrai slideshow publicitaire visible.
- Le style est tres charge en effets: particules, glow, blur, gradients, ombres fortes.
  Cela donne un rendu moins premium et peut fatiguer sur mobile.
- Les icones sont des emojis dans les boutons et champs. Pour un rendu pro, il faut
  passer a des icones SVG homogenes.
- Les pages secondaires ne sont pas au meme niveau que `login.html`.
- Certains liens externes de polices Google peuvent poser probleme sur un portail captif
  si l'utilisateur n'a pas encore Internet.
- `service.js` contient des composants Vue lies a Instagram et au COVID Indonesie,
  probablement hors sujet et potentiellement casses.
- `status.html` reference un iframe `exp` commente, mais le script essaie encore de le
  modifier.

## Direction UI recommandee

Je recommande une interface en deux zones:

- A gauche ou en haut mobile: carte de connexion claire, compacte, rassurante.
- A droite ou sous la carte mobile: slideshow publicitaire avec offres, promos,
  informations reseau et messages de marque.

Le rendu doit etre moderne mais plus controle:

- Fond sobre, pas trop sombre, avec une texture ou image legere si besoin.
- Palette courte: couleur principale, accent commercial, neutres lisibles.
- Typographie locale pour eviter les dependances reseau.
- Boutons francs, focus visibles, inputs lisibles.
- Tarifs presentes comme offres scannables, pas comme tableau serre.

## Priorites UX

1. Connexion rapide par ticket.
2. Passage simple vers le mode membre.
3. Prix et contact visibles sans surcharge.
4. Publicites valorisees sans bloquer la connexion.
5. Pages status/logout/success/error coherentes apres connexion.
