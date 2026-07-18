import { Routes } from '@angular/router';
import { authGuard }      from './core/guards/auth.guard';
import { profileGuard }   from './core/guards/profile.guard';
import { studentGuard, recruiterGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // ── Protected layout shell ─────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [

      // ── Shared (both roles) ────────────────────────────────────────────────
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // ── Student-only routes ────────────────────────────────────────────────
      {
        path: 'onboarding',
        canActivate: [studentGuard],
        loadComponent: () => import('./features/profile/profile-wizard/profile-wizard.component').then(m => m.ProfileWizardComponent)
      },
      {
        path: 'jobs',
        canActivate: [studentGuard, profileGuard],
        loadComponent: () => import('./features/jobs/job-list/job-list.component').then(m => m.JobListComponent)
      },
      {
        path: 'jobs/:id',
        canActivate: [studentGuard, profileGuard],
        loadComponent: () => import('./features/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent)
      },
      {
        path: 'tracker',
        canActivate: [studentGuard, profileGuard],
        loadComponent: () => import('./features/tracker/tracker.component').then(m => m.ApplicationTrackerComponent)
      },

      // ── Recruiter-only routes ──────────────────────────────────────────────
      {
        path: 'recruiter/applications',
        canActivate: [recruiterGuard],
        loadComponent: () => import('./features/tracker/tracker.component').then(m => m.ApplicationTrackerComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
