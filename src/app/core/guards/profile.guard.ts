import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

export const profileGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const profileService = inject(ProfileService);
  const router = inject(Router);

  // If not student, bypass profile check (e.g. recruiters)
  if (!authService.isStudent()) {
    return true;
  }

  const profile = profileService.currentProfile();
  
  // If student has a profile, and has populated at least skills or gpa, let them pass
  if (profile && profile.gpa > 0 && profile.skills && profile.skills.length > 0) {
    return true;
  }

  // Redirect to onboarding page
  return router.createUrlTree(['/onboarding']);
};
