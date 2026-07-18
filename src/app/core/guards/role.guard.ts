import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Guard — only STUDENT role can pass */
export const studentGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated())  return router.createUrlTree(['/login']);
  if (auth.isStudent())         return true;
  // Recruiter tried to hit student route — send to dashboard
  return router.createUrlTree(['/dashboard']);
};

/** Guard — only RECRUITER role can pass */
export const recruiterGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated())  return router.createUrlTree(['/login']);
  if (auth.isRecruiter())       return true;
  // Student tried to hit recruiter route — send to jobs
  return router.createUrlTree(['/jobs']);
};
