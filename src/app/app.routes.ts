import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { profileGuard } from './core/guards/profile.guard';

export const routes: Routes = [
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
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'onboarding',
        loadComponent: () => import('./features/profile/profile-wizard/profile-wizard.component').then(m => m.ProfileWizardComponent)
      },
      {
        path: 'dashboard',
        canActivate: [profileGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'jobs',
        canActivate: [profileGuard],
        loadComponent: () => import('./features/jobs/job-list/job-list.component').then(m => m.JobListComponent)
      },
      {
        path: 'jobs/:id',
        canActivate: [profileGuard],
        loadComponent: () => import('./features/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent)
      },
      {
        path: 'tracker',
        canActivate: [profileGuard],
        loadComponent: () => import('./features/tracker/tracker.component').then(m => m.ApplicationTrackerComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
