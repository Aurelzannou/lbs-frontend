#!/bin/sh
# Régénère /env.js à partir des variables d'environnement au démarrage du conteneur.
# Placé dans /docker-entrypoint.d/ : exécuté automatiquement par l'image nginx
# AVANT le lancement de nginx.
set -eu

TARGET="/usr/share/nginx/html/env.js"

API_URL="${API_URL:-}"
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8083}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-lbs-realm}"
KEYCLOAK_CLIENT_ID="${KEYCLOAK_CLIENT_ID:-lbs-client}"

cat > "$TARGET" <<EOF
window.__env = {
  apiUrl: '${API_URL}',
  keycloakUrl: '${KEYCLOAK_URL}',
  keycloakRealm: '${KEYCLOAK_REALM}',
  keycloakClientId: '${KEYCLOAK_CLIENT_ID}'
};
EOF

echo "[env] env.js généré : apiUrl='${API_URL}' keycloakUrl='${KEYCLOAK_URL}' realm='${KEYCLOAK_REALM}' clientId='${KEYCLOAK_CLIENT_ID}'"
