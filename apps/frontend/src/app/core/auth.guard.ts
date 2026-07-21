import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.hasValidToken()) return true;
  auth.login();   // redirects to Cognito hosted UI
  return false;
};
