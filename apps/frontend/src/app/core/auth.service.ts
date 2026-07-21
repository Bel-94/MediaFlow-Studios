import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const STORAGE = {
  ID_TOKEN:      's3files.id_token',
  ACCESS_TOKEN:  's3files.access_token',
  REFRESH_TOKEN: 's3files.refresh_token',
  EXPIRES_AT:    's3files.expires_at',
  CODE_VERIFIER: 's3files.code_verifier',
};

interface TokenResponse {
  id_token:      string;
  access_token:  string;
  refresh_token: string;
  expires_in:    number;
  token_type:    string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasValidToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  // ── PKCE helpers ─────────────────────────────────────────────────────────────

  private generateVerifier(): string {
    const array = new Uint8Array(64);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private async generateChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  // ── Step 1: redirect to Cognito hosted UI ────────────────────────────────────

  async login(): Promise<void> {
    const verifier = this.generateVerifier();
    const challenge = await this.generateChallenge(verifier);
    sessionStorage.setItem(STORAGE.CODE_VERIFIER, verifier);

    const params = new HttpParams()
      .set('response_type', 'code')
      .set('client_id', environment.cognitoClientId)
      .set('redirect_uri', environment.redirectUri)
      .set('scope', 'openid email')
      .set('code_challenge_method', 'S256')
      .set('code_challenge', challenge);

    window.location.href = `${environment.cognitoDomain}/oauth2/authorize?${params.toString()}`;
  }

  // ── Step 2: exchange auth code for tokens (called from /callback route) ──────

  async handleCallback(code: string): Promise<void> {
    const verifier = sessionStorage.getItem(STORAGE.CODE_VERIFIER);
    if (!verifier) throw new Error('Missing PKCE code verifier');

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', environment.cognitoClientId)
      .set('redirect_uri', environment.redirectUri)
      .set('code', code)
      .set('code_verifier', verifier);

    const tokens = await firstValueFrom(
      this.http.post<TokenResponse>(
        `${environment.cognitoDomain}/oauth2/token`,
        body.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
    );

    this.storeTokens(tokens);
    sessionStorage.removeItem(STORAGE.CODE_VERIFIER);
    this.loggedIn.next(true);
  }

  // ── Silent refresh using refresh token ───────────────────────────────────────

  async refresh(): Promise<void> {
    const refreshToken = localStorage.getItem(STORAGE.REFRESH_TOKEN);
    if (!refreshToken) { this.logout(); return; }

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', environment.cognitoClientId)
      .set('refresh_token', refreshToken);

    try {
      const tokens = await firstValueFrom(
        this.http.post<TokenResponse>(
          `${environment.cognitoDomain}/oauth2/token`,
          body.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
      );
      this.storeTokens(tokens);
    } catch {
      this.logout();
    }
  }

  // ── Token access ─────────────────────────────────────────────────────────────

  getIdToken(): string | null {
    if (!this.hasValidToken()) return null;
    return localStorage.getItem(STORAGE.ID_TOKEN);
  }

  hasValidToken(): boolean {
    const expiresAt = Number(localStorage.getItem(STORAGE.EXPIRES_AT) ?? 0);
    return !!localStorage.getItem(STORAGE.ID_TOKEN) && Date.now() < expiresAt;
  }

  logout(): void {
    Object.values(STORAGE).forEach(key => localStorage.removeItem(key));
    this.loggedIn.next(false);
    window.location.href =
      `${environment.cognitoDomain}/logout?client_id=${environment.cognitoClientId}&logout_uri=${environment.redirectUri}`;
  }

  // ── Private helpers ───────────────────────────────────────────────────────────

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(STORAGE.ID_TOKEN,      tokens.id_token);
    localStorage.setItem(STORAGE.ACCESS_TOKEN,  tokens.access_token);
    localStorage.setItem(STORAGE.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(STORAGE.EXPIRES_AT,    String(Date.now() + tokens.expires_in * 1000));
  }
}
