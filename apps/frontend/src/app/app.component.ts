import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    MatToolbarModule,
    MatButtonModule,
  ],
  template: `
    <div class="app-shell">
      <mat-toolbar class="top-bar">
        <a routerLink="/workspace" class="brand">
          <span class="brand-mark">MF</span>
          <span class="brand-text">MediaFlow Studios</span>
        </a>

        @if (auth.isLoggedIn$ | async) {
          <nav class="nav">
            <a mat-button routerLink="/workspace" routerLinkActive="active">Workspace</a>
            <a mat-button routerLink="/upload" routerLinkActive="active">Upload</a>
            <a mat-button routerLink="/analytics" routerLinkActive="active">Analytics</a>
            <span class="spacer"></span>
            <button mat-stroked-button type="button" (click)="auth.logout()">Sign out</button>
          </nav>
        } @else {
          <span class="spacer"></span>
          <button mat-flat-button color="primary" type="button" (click)="auth.login()">Sign in</button>
        }
      </mat-toolbar>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(1200px 500px at 10% -10%, rgba(14, 116, 144, 0.18), transparent 55%),
        radial-gradient(900px 400px at 100% 0%, rgba(217, 119, 6, 0.12), transparent 50%),
        linear-gradient(180deg, #f4f7f9 0%, #e8eef2 100%);
    }

    .top-bar {
      background: rgba(15, 39, 68, 0.96);
      color: #f8fafc;
      gap: 1rem;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      color: inherit;
      margin-right: 0.5rem;
    }

    .brand-mark {
      display: inline-grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: 0.4rem;
      background: #0e7490;
      color: #ecfeff;
      font-weight: 700;
      font-size: 0.75rem;
      letter-spacing: 0.04em;
    }

    .brand-text {
      font-family: "Source Serif 4", Georgia, serif;
      font-size: 1.15rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .nav {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 0.25rem;
    }

    .nav a {
      color: #cbd5e1;
    }

    .nav a.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
    }

    .spacer { flex: 1; }

    .content {
      flex: 1;
      width: min(1100px, calc(100% - 2rem));
      margin: 1.5rem auto 2.5rem;
    }

    @media (max-width: 720px) {
      .brand-text { display: none; }
      .nav { gap: 0; }
      .content { width: calc(100% - 1.25rem); margin-top: 1rem; }
    }
  `],
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
