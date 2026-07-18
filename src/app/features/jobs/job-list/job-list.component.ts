import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, JobWithMatch } from '../../../core/services/job.service';
import { TrackService } from '../../../core/services/track.service';
import { MatchScorePipe } from '../../../shared/pipes/match-score.pipe';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatchScorePipe],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent {
  jobService = inject(JobService);
  trackService = inject(TrackService);
  profileService = inject(ProfileService);
  toastService = inject(ToastService);

  toggleBookmark(jobId: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.jobService.toggleBookmark(jobId);
    const bookmarked = this.jobService.isBookmarked(jobId);
    if (bookmarked) {
      this.toastService.success('Job opportunity bookmarked!');
    } else {
      this.toastService.info('Removed bookmark.');
    }
  }

  isBookmarked(jobId: string): boolean {
    return this.jobService.isBookmarked(jobId);
  }

  // Search and Filter states (Signals!)
  searchQuery = signal<string>('');
  selectedWorkMode = signal<string>('all');
  selectedLocation = signal<string>('all');
  requiresSponsorship = signal<string>('all'); // 'all' | 'sponsorship_only' | 'no_sponsorship'
  selectedCategory = signal<string>('all');

  // Compute unique locations for filter dropdown
  locations = computed<string[]>(() => {
    const list = this.jobService.jobs().map(j => {
      return j.location;
    });
    return Array.from(new Set(list));
  });

  // Dynamic filter pipeline
  filteredJobs = computed<JobWithMatch[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const workMode = this.selectedWorkMode();
    const location = this.selectedLocation();
    const sponsorship = this.requiresSponsorship();
    const category = this.selectedCategory();
    const matches = this.jobService.matchedJobs();

    return matches.filter(job => {
      if (query) {
        const titleMatch = job.title.toLowerCase().includes(query);
        const companyMatch = job.company.toLowerCase().includes(query);
        const descMatch = job.description.toLowerCase().includes(query);
        const skillsMatch = job.skillsRequired.some(s => s.toLowerCase().includes(query));
        
        if (!titleMatch && !companyMatch && !descMatch && !skillsMatch) {
          return false;
        }
      }

      if (workMode !== 'all' && job.workMode !== workMode) {
        return false;
      }

      if (location !== 'all' && job.location !== location) {
        return false;
      }

      if (category !== 'all' && job.category !== category) {
        return false;
      }

      if (sponsorship !== 'all') {
        if (sponsorship === 'sponsorship_only' && !job.sponsorshipRequired) {
          return false;
        }
        if (sponsorship === 'no_sponsorship' && job.sponsorshipRequired) {
          return false;
        }
      }

      return true;
    });
  });

  applyingJobId = signal<string | null>(null);

  applyToJob(jobId: string, matchScore: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    
    this.applyingJobId.set(jobId);
    
    setTimeout(() => {
      const success = this.trackService.applyToJob(jobId, matchScore);
      this.applyingJobId.set(null);
      if (success) {
        this.triggerConfetti();
      }
    }, 600);
  }

  private triggerConfetti() {
    const colors = ['#6366f1', '#ec4899', '#a855f7', '#10b981', '#f59e0b'];
    const count = 40;
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      
      particle.style.left = (Math.random() * 100) + 'vw';
      particle.style.top = '-10px';
      
      const size = (Math.random() * 6 + 6) + 'px';
      particle.style.width = size;
      particle.style.height = size;
      
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.animationDuration = (Math.random() * 1.2 + 1.2) + 's';
      particle.style.animationDelay = (Math.random() * 0.3) + 's';
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 2200);
    }
  }

  isApplied(jobId: string): boolean {
    const profile = this.profileService.currentProfile();
    if (!profile) return false;
    const apps = this.trackService.getStudentApplications(profile.id);
    return apps.some(app => app.jobId === jobId);
  }

  getAppStatus(jobId: string): string {
    const profile = this.profileService.currentProfile();
    if (!profile) return '';
    const apps = this.trackService.getStudentApplications(profile.id);
    const found = apps.find(app => app.jobId === jobId);
    return found ? found.status : '';
  }
}
