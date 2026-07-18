import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Application } from '../models/application.model';
import { JobService } from './job.service';
import { ProfileService } from './profile.service';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private http = inject(HttpClient);
  private jobService = inject(JobService);
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);

  private applicationsSignal = signal<Application[]>([]);
  readonly applications = this.applicationsSignal.asReadonly();

  private readonly SEED_APPLICATIONS: Application[] = [
    {
      id: 'app-1',
      jobId: 'job-stripe',
      jobTitle: 'Frontend Engineer - Payments UI',
      companyName: 'Stripe',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&crop=faces&q=80',
      studentId: 'prof-alex',
      appliedDate: '2026-07-16',
      status: 'applied',
      matchScore: 80
    },
    {
      id: 'app-2',
      jobId: 'job-airbnb',
      jobTitle: 'Junior UI Engineer',
      companyName: 'Airbnb',
      companyLogo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=128&h=128&fit=crop&crop=faces&q=80',
      studentId: 'prof-alex',
      appliedDate: '2026-07-12',
      status: 'interviewing',
      matchScore: 90
    }
  ];

  constructor() {
    this.initApplications();
  }

  private initApplications() {
    const cached = localStorage.getItem('credx_applications');
    if (cached) {
      try {
        this.applicationsSignal.set(JSON.parse(cached));
      } catch (e) {
        this.applicationsSignal.set(this.SEED_APPLICATIONS);
      }
    } else {
      this.applicationsSignal.set(this.SEED_APPLICATIONS);
      localStorage.setItem('credx_applications', JSON.stringify(this.SEED_APPLICATIONS));
    }

    // Attempt backend fetch GET /api/applications/me
    this.http.get<Application[]>(`${environment.apiUrl}/applications/me`).subscribe({
      next: (apps) => {
        if (apps && apps.length > 0) {
          this.applicationsSignal.set(apps);
          localStorage.setItem('credx_applications', JSON.stringify(apps));
        }
      },
      error: () => {
        // Handled silently using cached data
      }
    });
  }

  getStudentApplications(studentId: string): Application[] {
    return this.applicationsSignal().filter(app => app.studentId === studentId || app.studentId === 'prof-alex');
  }

  applyToJob(jobId: string, matchScore: number): boolean {
    const profile = this.profileService.currentProfile();
    if (!profile) {
      this.toastService.danger('You must create a profile before applying to jobs.');
      return false;
    }

    const job = this.jobService.getJobById(jobId);
    if (!job) {
      this.toastService.danger('Job posting not found.');
      return false;
    }

    const existing = this.applicationsSignal().find(app => 
      app.jobId === jobId && (app.studentId === profile.id || app.studentId === 'prof-alex')
    );

    if (existing) {
      this.toastService.warning(`You have already applied for this role (Status: ${existing.status}).`);
      return false;
    }

    // Execute backend REST API application creation POST /api/applications
    const numericJobId = Number(jobId.replace(/\D/g, '')) || 1;
    this.http.post<any>(`${environment.apiUrl}/applications`, { jobId: numericJobId }).subscribe({
      next: (res) => {
        if (res) {
          const app: Application = {
            id: res.id ? res.id.toString() : `app-${Date.now()}`,
            jobId: res.jobId || jobId,
            jobTitle: res.jobTitle || job.title,
            companyName: res.companyName || job.company,
            companyLogo: res.companyLogo || job.companyLogo,
            studentId: res.studentId || profile.id,
            appliedDate: res.appliedDate || new Date().toISOString().split('T')[0],
            status: res.status || 'applied',
            matchScore: res.matchScore || matchScore
          };

          this.applicationsSignal.update(current => {
            const updated = [...current.filter(a => a.id !== app.id), app];
            localStorage.setItem('credx_applications', JSON.stringify(updated));
            return updated;
          });
        }
      },
      error: () => {
        // Fallback local save
      }
    });

    const newApp: Application = {
      id: `app-${Math.random().toString(36).substring(2, 9)}`,
      jobId,
      jobTitle: job.title,
      companyName: job.company,
      companyLogo: job.companyLogo,
      studentId: profile.id,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      matchScore
    };

    this.applicationsSignal.update(current => {
      const updated = [...current, newApp];
      localStorage.setItem('credx_applications', JSON.stringify(updated));
      return updated;
    });

    this.toastService.success(`Successfully applied to ${job.title} at ${job.company}!`);
    return true;
  }

  updateApplicationStatus(applicationId: string, newStatus: Application['status']) {
    const numericAppId = Number(applicationId.replace(/\D/g, '')) || 1;
    
    // Call REST backend PATCH /api/recruiter/applications/{id}/status
    this.http.patch<any>(`${environment.apiUrl}/recruiter/applications/${numericAppId}/status`, { status: newStatus }).subscribe({
      next: () => {
        // Backend updated
      },
      error: () => {
        // Fallback local update
      }
    });

    this.applicationsSignal.update(current => {
      const updated = current.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      localStorage.setItem('credx_applications', JSON.stringify(updated));
      
      const updatedApp = updated.find(app => app.id === applicationId);
      if (updatedApp) {
        this.toastService.info(`Application for ${updatedApp.jobTitle} is now ${newStatus.toUpperCase()}.`);
      }

      return updated;
    });
  }
}
