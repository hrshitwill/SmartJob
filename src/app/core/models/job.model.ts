export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  location: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  gpaThreshold: number;
  skillsRequired: string[];
  sponsorshipRequired: boolean; // if true, it means they are willing to sponsor (or require sponsorship status)
  // Let's model this clearly: if sponsorshipRequired is true, it means a student who 'needs_sponsorship' can match.
  // If sponsorshipRequired is false, it means they only hire students with work authorization ('authorized').
  salaryRange?: string;
  postedDate: string;
  category?: string;
}
