import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TuteurAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = environment.apiUrl;
  
  private tuteurSubject = new BehaviorSubject<any>(null);
  public tuteur$ = this.tuteurSubject.asObservable();

  public get currentTuteurValue(): any {
    return this.tuteurSubject.value;
  }

  constructor() {
    const savedTuteur = localStorage.getItem('tuteur_data');
    if (savedTuteur) {
      this.tuteurSubject.next(JSON.parse(savedTuteur));
    }
  }

  public get isTuteurLoggedIn(): boolean {
    return !!localStorage.getItem('tuteur_token');
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/portail/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('tuteur_token', response.token);
        localStorage.setItem('tuteur_data', JSON.stringify(response));
        this.tuteurSubject.next(response);
      })
    );
  }

  register(tuteur: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/portail/auth/register`, tuteur);
  }

  private authService: AuthService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }

  getToken(): string | null {
    return localStorage.getItem('tuteur_token');
  }
}
