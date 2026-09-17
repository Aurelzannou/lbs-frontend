# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Étape 1 — build Angular (production)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Dépendances (cache tant que package*.json/.npmrc ne changent pas)
# .npmrc (legacy-peer-deps) doit être présent AVANT npm ci, sinon le conflit de
# peer deps @nebular/Angular fait échouer l'install.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Code + build prod
COPY . .
RUN npm run build -- --configuration production

# ─────────────────────────────────────────────────────────────
# Étape 2 — image nginx qui sert le SPA + relaie /api
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Config nginx (SPA + proxy /api + cache)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Génère /env.js depuis les variables d'environnement au démarrage
COPY docker/30-render-env-js.sh /docker-entrypoint.d/30-render-env-js.sh
RUN chmod +x /docker-entrypoint.d/30-render-env-js.sh

# Fichiers statiques du build Angular
COPY --from=build /app/dist/lbs-frontend/browser /usr/share/nginx/html

EXPOSE 80

# Vérifie que nginx répond — 127.0.0.1 explicitement, pas "localhost" : nginx n'écoute qu'en
# IPv4 ici (notre nginx.conf personnalisé désactive l'ajout auto du listener IPv6 par l'image
# de base), donc "localhost" (résolu en IPv6 d'abord) se voit refuser la connexion à tort.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
