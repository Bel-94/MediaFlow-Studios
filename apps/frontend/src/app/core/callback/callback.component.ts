import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="wrap">
      <mat-spinner diameter="40"></mat-spinner>
      <p>Signing you in…</p>
    </div>
  `,
  styles: [`
    .wrap {
      min-height: 40vh;
      display: grid;
      place-items: center;
      gap: 1rem;
      color: #475569;
    }
  `],
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error || !code) {
      console.error('Cognito callback error:', error);
      await this.auth.login();
      return;
    }

    try {
      await this.auth.handleCallback(code);
      await this.router.navigate(['/workspace']);
    } catch (err) {
      console.error('Token exchange failed:', err);
      await this.auth.login();
    }
  }
}
