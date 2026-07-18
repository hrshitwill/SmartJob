export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  gpa: number;
  skills: string[];
  resumeName?: string;
  resumeUrl?: string;
  workAuthorization: 'authorized' | 'needs_sponsorship';
  preferredRole?: string;
  preferredLocation?: string;
  preferredWorkMode?: 'remote' | 'onsite' | 'hybrid' | 'all';
  
  // Expanded fields for premium profile scoring
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  certifications?: string[];
  projectsCount?: number;
}
