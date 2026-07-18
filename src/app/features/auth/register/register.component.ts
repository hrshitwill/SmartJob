import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  registerForm: FormGroup;
  selectedRole: 'student' | 'recruiter' = 'student';
  showSuccess = signal<boolean>(false);
  registeredName = signal<string>('');
  showPassword = signal<boolean>(false);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [true, [Validators.requiredTrue]]
    });
  }

  setRole(role: 'student' | 'recruiter') {
    this.selectedRole = role;
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  passwordsMatch(): boolean {
    const pwd = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    return pwd && confirm ? pwd === confirm : true;
  }

  getPasswordStrength(): { label: string; score: number; colorClass: string } {
    const pwd = this.registerForm.get('password')?.value || '';
    if (!pwd) return { label: '', score: 0, colorClass: '' };
    if (pwd.length < 6) return { label: 'Weak', score: 30, colorClass: 'weak' };
    
    let score = 50;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;

    if (score >= 80) return { label: 'Strong', score: 100, colorClass: 'strong' };
    if (score >= 50) return { label: 'Medium', score: 65, colorClass: 'medium' };
    return { label: 'Weak', score: 35, colorClass: 'weak' };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.toastService.danger('Please complete all form fields correctly.');
      return;
    }

    if (!this.passwordsMatch()) {
      this.toastService.danger('Passwords do not match.');
      return;
    }

    const { name, email } = this.registerForm.value;
    const success = this.authService.register(name, email, this.selectedRole);

    if (success) {
      this.registeredName.set(name);
      this.showSuccess.set(true);

      // Perform auto login and redirect after a 3s celebration period
      setTimeout(() => {
        this.authService.login(email, this.selectedRole);
        if (this.selectedRole === 'student') {
          this.router.navigate(['/onboarding']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }, 3000);
      
    } else {
      this.toastService.danger('This email address is already in use. Please sign in instead.');
    }
  }

  socialSignup(provider: string) {
    this.toastService.info(`Connecting with ${provider}... (UI Demo Only)`);
  }
}
