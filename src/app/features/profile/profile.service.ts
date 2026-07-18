import { Injectable, signal, effect, inject } from '@angular/core';
import { StudentProfile } from '../models/profile.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private authService = inject(AuthService);
  
  private currentProfileSignal = signal<StudentProfile | null>(null);
  readonly currentProfile = this.currentProfileSignal.asReadonly();

  // Seed profiles database in localStorage
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

    // Dynamically react to user changes in AuthService to load correct profile
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
    const profiles = this.getProfiles();
    let profile = profiles.find(p => p.userId === userId);
    
    if (!profile) {
      // Create an empty skeleton profile for the new student
      const user = this.authService.currentUser();
      profile = {
        id: `prof-${Math.random().toString(36).substring(2, 9)}`,
        userId: userId,
        name: user?.name || 'New Student',
        email: user?.email || '',
        gpa: 0,
        skills: [],
        workAuthorization: 'authorized',
        certifications: []
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

    // Save to database (localStorage)
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === current.id);
    if (index !== -1) {
      profiles[index] = updatedProfile;
    } else {
      profiles.push(updatedProfile);
    }
    localStorage.setItem('credx_profiles', JSON.stringify(profiles));
  }

  // Calculate profile completeness strength (0 - 100%)
  getProfileCompleteness(): number {
    const profile = this.currentProfileSignal();
    if (!profile) return 0;

    let score = 0;
    
    // 1. Basic Info (Name & Email) - 10%
    if (profile.name && profile.email) score += 10;
    
    // 2. Preferences (Preferred Role, Location, Work Mode) - 15%
    if (profile.preferredRole && profile.preferredLocation && profile.preferredWorkMode) {
      score += 15;
    } else if (profile.preferredRole || profile.preferredLocation) {
      score += 8;
    }
    
    // 3. Cumulative GPA - 15%
    if (profile.gpa > 0) score += 15;
    
    // 4. Skills List (having at least one skill) - 15%
    if (profile.skills && profile.skills.length > 0) {
      const skillScore = Math.min(profile.skills.length * 3, 15);
      score += skillScore;
    }
    
    // 5. Work Authorization choice - 10%
    if (profile.workAuthorization) score += 10;
    
    // 6. Resume uploaded - 15%
    if (profile.resumeName) score += 15;
    
    // 7. Social Links (5% each for GitHub & LinkedIn) - 10%
    if (profile.githubUrl) score += 5;
    if (profile.linkedinUrl) score += 5;
    
    // 8. Projects (at least one project) - 5%
    if (profile.projectsCount && profile.projectsCount > 0) score += 5;
    
    // 9. Certifications (at least one certification) - 5%
    if (profile.certifications && profile.certifications.length > 0) score += 5;

    return Math.min(score, 100);
  }

  getProfileSuggestions(): string[] {
    const profile = this.currentProfileSignal();
    if (!profile) return [];

    const tips: string[] = [];

    if (!profile.resumeName) {
      tips.push('📄 Upload your resume to gain +15% profile strength.');
    }
    if (!profile.skills || profile.skills.length < 5) {
      tips.push(`⚡ Add ${5 - (profile.skills?.length || 0)} more skills to boost your match ranking.`);
    }
    if (!profile.githubUrl) {
      tips.push('💻 Connect your GitHub profile for +5% strength.');
    }
    if (!profile.linkedinUrl) {
      tips.push('👔 Add your LinkedIn profile link for +5% strength.');
    }
    if (!profile.certifications || profile.certifications.length === 0) {
      tips.push('🏆 Add a technical certification.');
    }

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
