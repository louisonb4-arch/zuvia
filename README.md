# Zuvia — Jugos naturales en porciones

Site vitrine statique (HTML / CSS / JS, sans build) pour la marque Zuvia.

## Structure
- `index.html` — page unique
- `css/base.css` — tokens (couleurs, typo), boutons, header, éléments partagés
- `css/sections.css` — hero, gama, fiche saveur, étapes, paquetes, bande CTA, FAQ, footer
- `js/data.js` — saveurs, prix (MXN), plans, fruits par saveur
- `js/builder.js` — configurateur de paquete + message WhatsApp
- `js/flavors.js` — hero, la gama, fiche saveur (changement de saveur animé)
- `js/motion.js` — intro, animations au scroll (GSAP + ScrollTrigger + SplitText)
- `js/vendor/` — GSAP 3.13 en local
- `img/` — sachets détourés, fruits, verres, étapes (WebP)

## Modifier
- Prix / plans / ingrédients : `js/data.js`
- Numéro WhatsApp : `WA_NUMBER` dans `js/data.js`

## Déploiement
Vercel, projet statique (Framework Preset: Other, aucune commande de build, output = racine).

Site réalisé par [Vokum](https://vokumagency.com).
