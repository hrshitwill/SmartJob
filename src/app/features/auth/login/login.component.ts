import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface CareerQuote {
  text: string;
  author: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loginForm: FormGroup;
  selectedRole: 'student' | 'recruiter' = 'student';
  
  // Custom interactive login features
  showPassword = signal<boolean>(false);
  rememberMe = signal<boolean>(true);
  currentQuoteIndex = signal<number>(0);
  private quoteInterval: any;

  quotes: CareerQuote[] = [
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
    { text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.", author: "Lou Holtz" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" }
  ];

  constructor() {
    this.loginForm = this.fb.group({
      email: ['student@credx.com', [Validators.required, Validators.email]],
      password: ['••••••••', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Start Quote Rotation
    this.currentQuoteIndex.set(Math.floor(Math.random() * this.quotes.length));
    this.quoteInterval = setInterval(() => {
      this.currentQuoteIndex.update(idx => (idx + 1) % this.quotes.length);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.quoteInterval) {
      clearInterval(this.quoteInterval);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(val => !val);
  }

  setRole(role: 'student' | 'recruiter') {
    this.selectedRole = role;
    if (role === 'student') {
      this.loginForm.patchValue({ email: 'student@credx.com' });
    } else {
      this.loginForm.patchValue({ email: 'recruiter@credx.com' });
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.toastService.danger('Please fill in a valid email and password.');
      return;
    }

    const { email } = this.loginForm.value;
    const success = this.authService.login(email, this.selectedRole);

    if (success) {
      this.toastService.success(`Welcome back, ${this.authService.currentUser()?.name}!`);
      this.router.navigate(['/dashboard']);
    } else {
      this.toastService.danger(`Login failed. Check your credentials or use Quick Sign In.`);
    }
  }

  quickSignIn(role: 'student' | 'recruiter') {
    this.selectedRole = role;
    const email = role === 'student' ? 'student@credx.com' : 'recruiter@credx.com';
    const success = this.authService.login(email, role);

    if (success) {
      this.toastService.success(`Logged in as ${this.authService.currentUser()?.name} (Quick Sign In)`);
      this.router.navigate(['/dashboard']);
    }
  }

  // Social Login Mock
  socialLogin(provider: string) {
    this.toastService.info(`Connecting with ${provider}... (UI Demo Only)`);
  }
}
