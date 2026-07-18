import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { JobService, JobWithMatch } from '../../core/services/job.service';
import { TrackService } from '../../core/services/track.service';
import { ToastService } from '../../core/services/toast.service';
import { MatchScorePipe } from '../../shared/pipes/match-score.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, MatchScorePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  jobService = inject(JobService);
  trackService = inject(TrackService);
  toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  protected readonly Math = Math;

  // Recruiter Dashboard Specific
  showPostJobModal = signal<boolean>(false);
  postJobForm: FormGroup;
  
  // Available skills to select for new job postings
  jobSkillsList: string[] = ['Angular', 'TypeScript', 'SCSS', 'RxJS', 'Java', 'Spring Boot', 'SQL', 'Docker', 'REST API', 'Figma'];
  selectedJobSkills = signal<string[]>([]);
  newJobSkillText = '';

  // Recruiter Candidate Inspector Modal state with application link
  inspectedApplicantData = signal<{ profile: any; application: any } | null>(null);

  @HostListener('window:keydown.escape')
  handleEscape() {
    this.showPostJobModal.set(false);
    this.inspectedApplicantData.set(null);
  }

  inspectApplicant(app: any) {
    const profile = this.profileService.currentProfile() || {
      name: 'Alex Johnson',
      email: 'student@credx.com',
      gpa: 3.65,
      skills: ['Angular', 'TypeScript', 'SCSS', 'RxJS', 'Java', 'Spring Boot', 'SQL'],
      resumeName: 'alex_johnson_resume.pdf',
      workAuthorization: 'authorized',
      preferredRole: 'Frontend Developer',
      preferredLocation: 'Chicago, IL',
      preferredWorkMode: 'remote',
      githubUrl: 'https://github.com/alexjohnson',
      linkedinUrl: 'https://linkedin.com/in/alexjohnson',
      portfolioUrl: 'https://alexjohnson.dev',
      certifications: ['Angular Developer Associate', 'Spring Core Professional'],
      projectsCount: 3
    };
    
    this.inspectedApplicantData.set({ profile, application: app });
  }

  updateInspectedStatus(newStatus: 'applied' | 'reviewing' | 'interviewing' | 'offered' | 'declined') {
    const current = this.inspectedApplicantData();
    if (!current || !current.application) return;
    
    this.trackService.updateApplicationStatus(current.application.id, newStatus);
    
    this.inspectedApplicantData.set({
      ...current,
      application: { ...current.application, status: newStatus }
    });

    this.toastService.success(`Candidate status updated to: ${newStatus.toUpperCase()}`);
  }

  // Premium interactive career dashboard widgets data
  aiCareerScore = computed(() => {
    const profile = this.profileService.currentProfile();
    if (!profile) return 0;
    const completeness = this.profileService.getProfileCompleteness();
    const gpaFactor = profile.gpa ? (profile.gpa / 4.0) * 100 : 70;
    return Math.round((completeness * 0.6) + (gpaFactor * 0.4));
  });

  interviewReadiness = computed(() => {
    const profile = this.profileService.currentProfile();
    if (!profile) return 0;
    const completeness = this.profileService.getProfileCompleteness();
    return Math.round(completeness * 0.85);
  });

  skillsGrowth = [
    { month: 'Apr', count: 2 },
    { month: 'May', count: 4 },
    { month: 'Jun', count: 6 },
    { month: 'Jul', count: 7 }
  ];

  weeklyProgress = [
    { day: 'M', value: 30 },
    { day: 'T', value: 45 },
    { day: 'W', value: 80 },
    { day: 'T', value: 65 },
    { day: 'F', value: 50 },
    { day: 'S', value: 15 },
    { day: 'S', value: 10 }
  ];

  marketTrends = [
    { skill: 'Angular', change: '+14%', trend: 'up' },
    { skill: 'Spring Boot', change: '+8%', trend: 'up' },
    { skill: 'TypeScript', change: '+12%', trend: 'up' },
    { skill: 'Figma', change: '+5%', trend: 'up' },
    { skill: 'Docker', change: '-2%', trend: 'down' }
  ];

  dreamCompanies = [
    { name: 'Stripe', match: '85%', status: 'Active' },
    { name: 'Vercel', match: '60%', status: 'Highly Compatible' },
    { name: 'Linear', match: '80%', status: 'Active' }
  ];

  upcomingDeadlines = [
    { title: 'Frontend Engineer', company: 'Stripe', daysLeft: 3 },
    { title: 'Spring Boot Specialist', company: 'Google', daysLeft: 5 },
    { title: 'UI Intern', company: 'Vercel', daysLeft: 9 }
  ];

  constructor() {
    this.postJobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4)]],
      company: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      location: ['', Validators.required],
      workMode: ['hybrid', Validators.required],
      gpaThreshold: [3.0, [Validators.required, Validators.min(1.0), Validators.max(4.0)]],
      sponsorshipRequired: [false, Validators.required],
      salaryRange: ['', Validators.required],
      category: ['Frontend Engineering', Validators.required]
    });
  }

  // Student specific computations
  getStudentApplications() {
    const profile = this.profileService.currentProfile();
    return profile ? this.trackService.getStudentApplications(profile.id) : [];
  }

  getAverageMatchScore(): number {
    const jobs = this.jobService.matchedJobs();
    if (jobs.length === 0) return 0;
    const total = jobs.reduce((sum, j) => sum + j.match.score, 0);
    return Math.round(total / jobs.length);
  }

  // Recruiter computations
  getPostedJobs() {
    return this.jobService.jobs();
  }

  getApplicants() {
    return this.trackService.applications();
  }

  updateApplicantStatus(appId: string, status: any) {
    this.trackService.updateApplicationStatus(appId, status);
  }

  // Post Job Actions
  toggleJobSkill(skill: string) {
    this.selectedJobSkills.update(skills => {
      if (skills.includes(skill)) {
        return skills.filter(s => s !== skill);
      } else {
        return [...skills, skill];
      }
    });
  }

  addCustomJobSkill() {
    const trimmed = this.newJobSkillText.trim();
    if (!trimmed) return;
    this.selectedJobSkills.update(skills => {
      if (!skills.includes(trimmed)) {
        return [...skills, trimmed];
      }
      return skills;
    });
    this.newJobSkillText = '';
  }

  submitJob() {
    if (this.postJobForm.invalid) {
      this.toastService.danger('Please fill out all fields correctly.');
      return;
    }

    if (this.selectedJobSkills().length === 0) {
      this.toastService.warning('Please add at least one required skill.');
      return;
    }

    const newJob = {
      title: this.postJobForm.value.title,
      company: this.postJobForm.value.company,
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80',
      description: this.postJobForm.value.description,
      location: this.postJobForm.value.location,
      workMode: this.postJobForm.value.workMode,
      gpaThreshold: Number(this.postJobForm.value.gpaThreshold),
      skillsRequired: this.selectedJobSkills(),
      sponsorshipRequired: this.postJobForm.value.sponsorshipRequired === 'true' || this.postJobForm.value.sponsorshipRequired === true,
      salaryRange: this.postJobForm.value.salaryRange,
      category: this.postJobForm.value.category
    };

    this.jobService.addJob(newJob);
    this.toastService.success(`Successfully posted job: ${newJob.title} at ${newJob.company}!`);
    this.postJobForm.reset({ workMode: 'hybrid', gpaThreshold: 3.0, category: 'Frontend Engineering', sponsorshipRequired: false });
    this.selectedJobSkills.set([]);
    this.showPostJobModal.set(false);
  }
}
