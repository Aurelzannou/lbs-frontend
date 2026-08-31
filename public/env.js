// Configuration lue à l'exécution par l'application (voir src/environments/environment.ts).
// En développement : valeurs localhost ci-dessous.
// En production : ce fichier est RÉÉCRIT au démarrage du conteneur nginx à partir
//                 des variables d'environnement (API_URL, KEYCLOAK_URL, ...).
window.__env = {
  apiUrl: 'http://localhost:8082',
  keycloakUrl: 'http://localhost:8083',
  keycloakRealm: 'lbs-realm',
  keycloakClientId: 'lbs-client'
};
