import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  expiresInSeconds: number;
}

/** O que a API grava dentro do JWT (ver AuthController no backend). */
interface TokenClaims {
  sub: string; // id do funcionário
  email: string;
  role: string;
  permissions: string[];
  exp: number; // expiração, em segundos desde 1970
}

const STORAGE_KEY = 'roster.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentToken = signal<string | null>(readStoredToken());
  private readonly claims = computed(() => decodeToken(this.currentToken()));

  readonly token = this.currentToken.asReadonly();
  readonly isLoggedIn = computed(() => this.claims() !== null);
  readonly employeeId = computed(() => this.claims()?.sub ?? null);
  readonly email = computed(() => this.claims()?.email ?? null);
  readonly role = computed(() => this.claims()?.role ?? null);
  readonly permissions = computed(() => this.claims()?.permissions ?? []);

  /** Verdadeiro se o usuário tem pelo menos uma das permissões informadas. */
  can(...permissions: string[]): boolean {
    const granted = this.permissions();
    return permissions.some((permission) => granted.includes(permission));
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/api/auth/login', { email, password })
      .pipe(tap((response) => this.storeToken(response.token)));
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.currentToken.set(null);
    this.router.navigate(['/login']);
  }

  private storeToken(token: string): void {
    sessionStorage.setItem(STORAGE_KEY, token);
    this.currentToken.set(token);
  }
}

function readStoredToken(): string | null {
  const token = sessionStorage.getItem(STORAGE_KEY);
  return decodeToken(token) ? token : null;
}

/** Lê o miolo do JWT. Devolve null se o token não existe, é inválido ou expirou. */
function decodeToken(token: string | null): TokenClaims | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload)) as TokenClaims;
    return claims.exp * 1000 > Date.now() ? claims : null;
  } catch {
    return null;
  }
}
