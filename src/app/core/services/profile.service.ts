import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StudentProfile } from '../models/profile.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private currentProfileSignal = signal<StudentProfile | null>(null);
  readonly currentProfile = this.currentProfileSignal.asReadonly();

  private readonly SEED_PROFILE: StudentProfile = {
    id: 'prof-alex',
    userId: 'usr-student',
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

  constructor() {
    this.initProfiles();

    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.role === 'student') {
        this.loadProfileForUser(user.id);
      } else {
        this.currentProfileSignal.set(null);
      }
    });
  }

  private initProfiles() {
    if (!localStorage.getItem('credx_profiles')) {
      localStorage.setItem('credx_profiles', JSON.stringify([this.SEED_PROFILE]));
    }
  }

  private getProfiles(): StudentProfile[] {
    const profilesStr = localStorage.getItem('credx_profiles');
    return profilesStr ? JSON.parse(profilesStr) : [this.SEED_PROFILE];
  }

  private loadProfileForUser(userId: string) {
    // Attempt HTTP GET /api/students/me
    this.http.get<StudentProfile>(`${environment.apiUrl}/students/me`).subscribe({
      next: (profile) => {
        if (profile) {
          this.currentProfileSignal.set(profile);
        }
      },
      error: () => {
        this.loadFallbackProfile(userId);
      }
    });

    this.loadFallbackProfile(userId);
  }

  private loadFallbackProfile(userId: string) {
    const profiles = this.getProfiles();
    let profile = profiles.find(p => p.userId === userId);
    
    if (!profile) {
      const user = this.authService.currentUser();
      profile = {
        id: `prof-${Math.random().toString(36).substring(2, 9)}`,
        userId: userId,
        name: user?.name || 'Alex Johnson',
        email: user?.email || 'student@credx.com',
        gpa: 3.65,
        skills: ['Angular', 'TypeScript', 'SCSS', 'RxJS', 'Java', 'Spring Boot', 'SQL'],
        workAuthorization: 'authorized',
        certifications: ['Angular Developer Associate', 'Spring Core Professional'],
        resumeName: 'alex_johnson_resume.pdf'
      };
      
      profiles.push(profile);
      localStorage.setItem('credx_profiles', JSON.stringify(profiles));
    }
    
    this.currentProfileSignal.set(profile);
  }

  updateProfile(updates: Partial<StudentProfile>) {
    const current = this.currentProfileSignal();
    if (!current) return;

    const updatedProfile = { ...current, ...updates };
    this.currentProfileSignal.set(updatedProfile);

    // Call REST API backend PUT /api/students/me
    this.http.put<StudentProfile>(`${environment.apiUrl}/students/me`, updatedProfile).subscribe({
      next: (saved) => {
        if (saved) this.currentProfileSignal.set(saved);
      },
      error: () => {
        // Handled silently with local state persistence
      }
    });

    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === current.id);
    if (index !== -1) {
      profiles[index] = updatedProfile;
    } else {
      profiles.push(updatedProfile);
    }
    localStorage.setItem('credx_profiles', JSON.stringify(profiles));
  }

  getProfileCompleteness(): number {
    const profile = this.currentProfileSignal();
    if (!profile) return 0;

    let score = 0;
    if (profile.name && profile.email) score += 10;
    if (profile.preferredRole && profile.preferredLocation && profile.preferredWorkMode) {
      score += 15;
    } else if (profile.preferredRole || profile.preferredLocation) {
      score += 8;
    }
    if (profile.gpa > 0) score += 15;
    if (profile.skills && profile.skills.length > 0) {
      score += Math.min(profile.skills.length * 3, 15);
    }
    if (profile.workAuthorization) score += 10;
    if (profile.resumeName) score += 15;
    if (profile.githubUrl) score += 5;
    if (profile.linkedinUrl) score += 5;
    if (profile.projectsCount && profile.projectsCount > 0) score += 5;
    if (profile.certifications && profile.certifications.length > 0) score += 5;

    return Math.min(score, 100);
  }

  getProfileSuggestions(): string[] {
    const profile = this.currentProfileSignal();
    if (!profile) return [];

    const tips: string[] = [];
    if (!profile.resumeName) tips.push('📄 Upload your resume for +15% profile strength.');
    if (!profile.skills || profile.skills.length < 5) tips.push(`⚡ Add ${5 - (profile.skills?.length || 0)} more skills to boost match rankings.`);
    if (!profile.githubUrl) tips.push('💻 Connect your GitHub profile for +5% strength.');
    if (!profile.linkedinUrl) tips.push('👔 Add your LinkedIn profile link for +5% strength.');
    if (!profile.certifications || profile.certifications.length === 0) tips.push('🏆 Add a technical certification.');

    return tips;
  }

  getProfileLevelName(): { level: string; badgeClass: string } {
    const score = this.getProfileCompleteness();
    if (score < 30) return { level: 'Getting Started', badgeClass: 'badge-warning' };
    if (score < 60) return { level: 'Building Profile', badgeClass: 'badge-info' };
    if (score < 80) return { level: 'Recruiter Ready ⭐', badgeClass: 'badge-success' };
    if (score < 95) return { level: 'Strong Candidate 🚀', badgeClass: 'badge-primary' };
    return { level: 'Complete Profile 🏆', badgeClass: 'badge-primary' };
  }
}
