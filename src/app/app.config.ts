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
  return () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const idToken = localStorage.getItem('id_token');

    const options: any = {
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false
      }
    };

    // Restoration of tokens for F5 persistence
    if (accessToken && refreshToken) {
      options.initOptions.token = accessToken;
      options.initOptions.refreshToken = refreshToken;
      if (idToken) options.initOptions.idToken = idToken;
    }

    // Wrap initialization with a timeout to prevent white screen if Keycloak hangs
    const initPromise = keycloak.init(options);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Keycloak init timeout')), 5000)
    );

    return Promise.race([initPromise, timeoutPromise])
      .catch(err => {
        console.warn('Échec ou timeout de l\'initialisation Keycloak:', err);
        // Clean corrupted/expired tokens
        if (err.message === 'Keycloak init timeout' || (err && typeof err === 'object')) {
           localStorage.removeItem('access_token');
           localStorage.removeItem('refresh_token');
           localStorage.removeItem('id_token');
        }
        return Promise.resolve();
      });
  };
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
