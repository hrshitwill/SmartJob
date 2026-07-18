import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobService, JobWithMatch } from '../../../core/services/job.service';
import { TrackService } from '../../../core/services/track.service';
import { ProfileService } from '../../../core/services/profile.service';
import { MatchScorePipe } from '../../../shared/pipes/match-score.pipe';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatchScorePipe],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss'
})
export class JobDetailComponent implements OnInit {
  job = signal<JobWithMatch | null>(null);
  profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private trackService = inject(TrackService);


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const jobId = params.get('id');
      if (jobId) {
        const foundJob = this.jobService.getJobById(jobId);
        if (foundJob) {
          this.job.set(foundJob);
        } else {
          this.router.navigate(['/jobs']);
        }
      } else {
        this.router.navigate(['/jobs']);
      }
    });
  }

  applyToJob() {
    const currentJob = this.job();
    if (!currentJob) return;

    const success = this.trackService.applyToJob(currentJob.id, currentJob.match.score);
    if (success) {
      // Reload matching details state
      const updatedJob = this.jobService.getJobById(currentJob.id);
      if (updatedJob) {
        this.job.set(updatedJob);
      }
    }
  }

  isApplied(): boolean {
    const currentJob = this.job();
    const profile = this.profileService.currentProfile();
    if (!currentJob || !profile) return false;
    
    return this.trackService.getStudentApplications(profile.id)
      .some(app => app.jobId === currentJob.id);
  }

  getAppStatus(): string {
    const currentJob = this.job();
    const profile = this.profileService.currentProfile();
    if (!currentJob || !profile) return '';

    const found = this.trackService.getStudentApplications(profile.id)
      .find(app => app.jobId === currentJob.id);
    return found ? found.status : '';
  }
}
