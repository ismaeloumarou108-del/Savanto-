# Weblocal Agency — site vitrine 3D

Site statique (HTML / CSS / JS) avec une scène Three.js : un repère de carte (pin) qui se déplace
et change de couleur au fil du scroll, puis se démultiplie en fin de page (visibilité → croissance).

## Lancer
    cd weblocal-site && python3 -m http.server 8000   # puis http://localhost:8000
(Les polices sont chargées en module : utiliser un serveur HTTP, pas `file://`.)

## Modifier le code 3D
`src/main.js` est la source ; `assets/app.js` est le bundle minifié (three.js inclus).
    npm i three esbuild
    npx esbuild src/main.js --bundle --minify --format=iife --target=es2020 --outfile=assets/app.js

## À personnaliser
- E-mail de contact : `contact@weblocalagency.com` dans `index.html` (placeholder)
- Palette : variables CSS en haut de `assets/style.css`
