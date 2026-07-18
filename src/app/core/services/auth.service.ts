import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

export interface LoginRequest  { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; role: string; }
export interface AuthResponse  { id: string; email: string; name: string; role: string; token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor() { this.restoreSession(); }

  // ── Restore persisted session ──────────────────────────────────────────────
  private restoreSession() {
    const raw = localStorage.getItem('credx_session');
    if (!raw) return;
    try {
      const parsed: User = JSON.parse(raw);
      this.currentUserSignal.set(parsed);
    } catch {
      this.clearStorage();
    }
  }

  // ── Real backend login (returns Observable so callers can handle errors) ───
  login$(creds: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, creds).pipe(
      tap(res  => this.persistSession(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ── Real backend register ──────────────────────────────────────────────────
  register$(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap(res  => this.persistSession(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ── Persist user + token to localStorage ──────────────────────────────────
  private persistSession(res: AuthResponse) {
    const user: User = {
      id:    res.id,
      email: res.email,
      name:  res.name,
      role:  res.role.toLowerCase() as 'student' | 'recruiter',
      token: res.token
    };
    localStorage.setItem('credx_session', JSON.stringify(user));
    localStorage.setItem('credx_token',   res.token);
    this.currentUserSignal.set(user);
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout() {
    this.clearStorage();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private clearStorage() {
    localStorage.removeItem('credx_session');
    localStorage.removeItem('credx_token');
  }

  // ── Role helpers (used by guards & templates) ──────────────────────────────
  isAuthenticated(): boolean  { return this.currentUserSignal() !== null; }
  isStudent():       boolean  { return this.currentUserSignal()?.role === 'student'; }
  isRecruiter():     boolean  { return this.currentUserSignal()?.role === 'recruiter'; }
  getRole():         string   { return this.currentUserSignal()?.role ?? ''; }
}
