export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'recruiter';
  token?: string;
}
