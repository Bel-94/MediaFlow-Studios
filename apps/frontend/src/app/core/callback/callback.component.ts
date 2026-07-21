import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `<p>Signing you in...</p>`,
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
      await this.router.navigate(['/login']);
      return;
    }

    try {
      await this.auth.handleCallback(code);
      await this.router.navigate(['/workspace']);
    } catch (err) {
      console.error('Token exchange failed:', err);
      await this.router.navigate(['/login']);
    }
  }
}
