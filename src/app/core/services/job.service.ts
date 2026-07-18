import { Injectable, inject, signal, computed } from '@angular/core';
import { Job } from '../models/job.model';
import { ProfileService } from './profile.service';
import { MatchEngineService, MatchBreakdown } from './match-engine.service';

export interface JobWithMatch extends Job {
  match: MatchBreakdown;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private profileService = inject(ProfileService);
  private matchEngineService = inject(MatchEngineService);

  private jobsSignal = signal<Job[]>([]);
  readonly jobs = this.jobsSignal.asReadonly();

  private readonly SEED_JOBS: Job[] = [
    {
      id: 'job-stripe',
      title: 'Frontend Engineer - Payments UI',
      company: 'Stripe',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&crop=faces&q=80',
      description: 'Join the payments flow team to design, build, and optimize Stripe Elements and Checkout interfaces. You will work heavily with Angular, TypeScript, and fine-tune CSS layouts to ensure seamless, accessible payment checkout experiences for millions of consumers.',
      location: 'Chicago, IL',
      workMode: 'hybrid',
      gpaThreshold: 3.5,
      skillsRequired: ['Angular', 'TypeScript', 'SCSS', 'RxJS', 'Web Performance'],
      sponsorshipRequired: false,
      salaryRange: '$135,000 - $165,000',
      postedDate: '2026-07-15',
      category: 'Frontend Engineering'
    },
    {
      id: 'job-vercel',
      title: 'Angular Developer (Internship)',
      company: 'Vercel',
      companyLogo: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=128&h=128&fit=crop&crop=faces&q=80',
      description: 'We are looking for an Angular Intern who is passionate about build systems, fast rendering, and building beautiful, responsive dashboards. You will help build and maintain our integration portals, connecting enterprise frameworks with the Vercel platform.',
      location: 'Remote',
      workMode: 'remote',
      gpaThreshold: 3.2,
      skillsRequired: ['Angular', 'TypeScript', 'SCSS', 'Git'],
      sponsorshipRequired: true,
      salaryRange: '$45 - $60 / hour',
      postedDate: '2026-07-16',
      category: 'Frontend Engineering'
    },
    {
      id: 'job-linear',
      title: 'UI Developer & Product Designer',
      company: 'Linear',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&crop=faces&q=80',
      description: 'At Linear, we care deeply about visual precision, speed, and clean interactions. You will span the gap between design and frontend code. Working in our UI platform team, you will implement smooth, high-fidelity components, micro-animations, and keyboard shortcuts.',
      location: 'New York, NY',
      workMode: 'onsite',
      gpaThreshold: 3.0,
      skillsRequired: ['TypeScript', 'SCSS', 'Animations', 'Figma', 'Angular'],
      sponsorshipRequired: false,
      salaryRange: '$140,000 - $175,000',
      postedDate: '2026-07-14',
      category: 'Design & Engineering'
    },
    {
      id: 'job-google',
      title: 'Software Engineer - Spring Boot Platform',
      company: 'Google',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&h=128&fit=crop&crop=faces&q=80',
      description: 'Develop back-end platform components for cloud applications. In this role, you will build microservices using Spring Boot, manage relational databases (SQL), write REST APIs, and optimize Docker deployments running on Google Cloud Platform.',
      location: 'Mountain View, CA',
      workMode: 'hybrid',
      gpaThreshold: 3.6,
      skillsRequired: ['Java', 'Spring Boot', 'SQL', 'REST API', 'Docker'],
      sponsorshipRequired: true,
      salaryRange: '$165,000 - $210,000',
      postedDate: '2026-07-12',
      category: 'Backend Engineering'
    },
    {
      id: 'job-notion',
      title: 'Full Stack Engineer - Collaboration Tools',
      company: 'Notion',
      companyLogo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop&crop=faces&q=80',
      description: 'Work across the stack to build rich collaborative workspace documents. You will integrate frontend Angular standalone views with backend Spring Boot services. You should be comfortable with reactive programming in RxJS and database normalization in SQL.',
      location: 'San Francisco, CA',
      workMode: 'hybrid',
      gpaThreshold: 3.4,
      skillsRequired: ['TypeScript', 'Angular', 'Java', 'Spring Boot', 'SQL'],
      sponsorshipRequired: true,
      salaryRange: '$130,000 - $160,000',
      postedDate: '2026-07-17',
      category: 'Full Stack Engineering'
    },
    {
      id: 'job-airbnb',
      title: 'Junior UI Engineer',
      company: 'Airbnb',
      companyLogo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=128&h=128&fit=crop&crop=faces&q=80',
      description: 'Help us redefine modern digital travel bookings. We are seeking a Junior UI Engineer to focus on component libraries, responsive grids, and clean design patterns. You will build and test modules in Angular, collaborating with Figma designers.',
      location: 'Remote',
      workMode: 'remote',
      gpaThreshold: 3.0,
      skillsRequired: ['Angular', 'TypeScript', 'SCSS', 'RxJS'],
      sponsorshipRequired: false,
      salaryRange: '$95,000 - $120,000',
      postedDate: '2026-07-10',
      category: 'Frontend Engineering'
    }
  ];

  // Live computed property that returns jobs with calculated match scores for the active profile,
  // sorted by match score descending.
  readonly matchedJobs = computed<JobWithMatch[]>(() => {
    const profile = this.profileService.currentProfile();
    const jobs = this.jobsSignal();
    
    return jobs.map(job => {
      const match = this.matchEngineService.calculateMatch(profile, job);
      return {
        ...job,
        match
      };
    }).sort((a, b) => b.match.score - a.match.score);
  });

  private bookmarkedIdsSignal = signal<string[]>([]);
  readonly bookmarkedIds = this.bookmarkedIdsSignal.asReadonly();

  constructor() {
    this.initJobs();
    this.initBookmarks();
  }

  private initBookmarks() {
    const cached = localStorage.getItem('credx_bookmarks');
    if (cached) {
      try {
        this.bookmarkedIdsSignal.set(JSON.parse(cached));
      } catch (e) {
        localStorage.setItem('credx_bookmarks', JSON.stringify([]));
      }
    }
  }

  toggleBookmark(jobId: string) {
    this.bookmarkedIdsSignal.update(current => {
      const updated = current.includes(jobId)
        ? current.filter(id => id !== jobId)
        : [...current, jobId];
      localStorage.setItem('credx_bookmarks', JSON.stringify(updated));
      return updated;
    });
  }

  isBookmarked(jobId: string): boolean {
    return this.bookmarkedIdsSignal().includes(jobId);
  }

  private initJobs() {
    const cached = localStorage.getItem('credx_jobs');
    if (cached) {
      try {
        this.jobsSignal.set(JSON.parse(cached));
      } catch (e) {
        this.jobsSignal.set(this.SEED_JOBS);
        localStorage.setItem('credx_jobs', JSON.stringify(this.SEED_JOBS));
      }
    } else {
      this.jobsSignal.set(this.SEED_JOBS);
      localStorage.setItem('credx_jobs', JSON.stringify(this.SEED_JOBS));
    }
  }

  getJobById(id: string): JobWithMatch | null {
    const jobs = this.matchedJobs();
    return jobs.find(j => j.id === id) || null;
  }

  addJob(jobData: Omit<Job, 'id' | 'postedDate'>) {
    const newJob: Job = {
      ...jobData,
      id: `job-${Math.random().toString(36).substring(2, 9)}`,
      postedDate: new Date().toISOString().split('T')[0]
    };

    this.jobsSignal.update(current => {
      const updated = [newJob, ...current];
      localStorage.setItem('credx_jobs', JSON.stringify(updated));
      return updated;
    });
  }
}
