import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { KeycloakService, KeycloakBearerInterceptor } from 'keycloak-angular';
import { environment } from '../environments/environment';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

import { routes } from './app.routes';
import { importProvidersFrom } from '@angular/core';
import { NbThemeModule, NbLayoutModule, NbSidebarModule, NbMenuModule, NbDialogModule, NbWindowModule, NbToastrModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false
      }
    }).catch(err => {
      console.error('Échec de l\'initialisation de Keycloak:', err);
      // On laisse l'app démarrer même en cas d'erreur
      return Promise.resolve();
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    importProvidersFrom(
      NbThemeModule.forRoot({ name: 'default' }),
      NbLayoutModule,
      NbSidebarModule.forRoot(),
      NbMenuModule.forRoot(),
      NbDialogModule.forRoot(),
      NbWindowModule.forRoot(),
      NbToastrModule.forRoot(),
      NbEvaIconsModule
    ),
    KeycloakService
  ]
};
