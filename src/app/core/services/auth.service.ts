import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  private readonly SEED_USERS: User[] = [
    { id: 'usr-student', email: 'student@credx.com', name: 'Alex Johnson', role: 'student', token: 'mock-jwt-student-token' },
    { id: 'usr-recruiter', email: 'recruiter@credx.com', name: 'Sarah Miller', role: 'recruiter', token: 'mock-jwt-recruiter-token' }
  ];

  constructor() {
    this.initSession();
  }

  private initSession() {
    if (!localStorage.getItem('credx_users')) {
      localStorage.setItem('credx_users', JSON.stringify(this.SEED_USERS));
    }
    
    const activeUser = localStorage.getItem('credx_session');
    if (activeUser) {
      try {
        const parsed: User = JSON.parse(activeUser);
        this.currentUserSignal.set(parsed);
        if (parsed.token) {
          localStorage.setItem('credx_token', parsed.token);
        }
      } catch (e) {
        localStorage.removeItem('credx_session');
      }
    }
  }

  getUsers(): User[] {
    const usersStr = localStorage.getItem('credx_users');
    return usersStr ? JSON.parse(usersStr) : this.SEED_USERS;
  }

  login(email: string, role: 'student' | 'recruiter'): boolean {
    // Attempt Spring Boot REST API login call asynchronously
    this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password: 'password' }).subscribe({
      next: (res) => {
        const user: User = {
          id: res.id || '1',
          email: res.email,
          name: res.name,
          role: res.role ? (res.role.toLowerCase() as any) : role,
          token: res.token
        };
        this.saveUserSession(user);
      },
      error: () => {
        // Spring Boot fallback / mock session
        this.fallbackLogin(email, role);
      }
    });

    // Synchronously execute local session setup so UI flows stay immediate
    return this.fallbackLogin(email, role);
  }

  register(name: string, email: string, role: 'student' | 'recruiter'): boolean {
    this.http.post<any>(`${environment.apiUrl}/auth/register`, { name, email, password: 'password', role }).subscribe({
      next: (res) => {
        const user: User = {
          id: res.id || '1',
          email: res.email,
          name: res.name,
          role: res.role ? (res.role.toLowerCase() as any) : role,
          token: res.token
        };
        this.saveUserSession(user);
      },
      error: () => {
        this.fallbackRegister(name, email, role);
      }
    });

    return this.fallbackRegister(name, email, role);
  }

  private saveUserSession(user: User) {
    localStorage.setItem('credx_session', JSON.stringify(user));
    if (user.token) {
      localStorage.setItem('credx_token', user.token);
    }
    this.currentUserSignal.set(user);
  }

  private fallbackLogin(email: string, role: 'student' | 'recruiter'): boolean {
    const users = this.getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    
    if (foundUser) {
      const sessionUser: User = { ...foundUser, token: foundUser.token || `mock-jwt-${role}-token-${Date.now()}` };
      this.saveUserSession(sessionUser);
      return true;
    }

    // Default fallback user creation for demo accounts
    const newUser: User = {
      id: role === 'student' ? 'usr-student' : 'usr-recruiter',
      email,
      name: role === 'student' ? 'Alex Johnson' : 'Sarah Miller',
      role,
      token: `mock-jwt-${role}-token-${Date.now()}`
    };
    this.saveUserSession(newUser);
    return true;
  }

  private fallbackRegister(name: string, email: string, role: 'student' | 'recruiter'): boolean {
    const users = this.getUsers();
    const newUser: User = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      role,
      token: `mock-jwt-${role}-token-${Date.now()}`
    };

    users.push(newUser);
    localStorage.setItem('credx_users', JSON.stringify(users));
    this.saveUserSession(newUser);
    return true;
  }

  logout() {
    localStorage.removeItem('credx_session');
    localStorage.removeItem('credx_token');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  isStudent(): boolean {
    return this.currentUserSignal()?.role === 'student';
  }

  isRecruiter(): boolean {
    return this.currentUserSignal()?.role === 'recruiter';
  }
}
