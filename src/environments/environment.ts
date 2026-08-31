/**
 * Environnement utilisé par le build de PRODUCTION (`ng build`).
 *
 * Les URLs ne sont PAS figées à la compilation : elles sont lues à l'exécution
 * depuis `window.__env`, injecté par le fichier `/env.js` (voir `public/env.js`).
 * En production, ce fichier est régénéré au démarrage du conteneur nginx à partir
 * des variables d'environnement — on construit donc l'image une seule fois et on
 * la configure au déploiement.
 *
 * Pour le `ng serve` local, c'est `environment.development.ts` qui est utilisé.
 */
declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
      keycloakUrl?: string;
      keycloakRealm?: string;
      keycloakClientId?: string;
    };
  }
}

const runtime = (typeof window !== 'undefined' && window.__env) || {};

export const environment = {
  production: true,
  // Vide = même origine : les appels `/api/...` sont relayés vers le backend par nginx.
  apiUrl: runtime.apiUrl ?? '',
  keycloak: {
    url: runtime.keycloakUrl ?? 'http://localhost:8083',
    realm: runtime.keycloakRealm ?? 'lbs-realm',
    clientId: runtime.keycloakClientId ?? 'lbs-client'
  }
};
