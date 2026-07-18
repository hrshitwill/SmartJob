export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  studentId: string;
  appliedDate: string;
  status: 'applied' | 'reviewing' | 'interviewing' | 'offered' | 'declined';
  matchScore: number;
}
