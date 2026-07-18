import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface CareerQuote { text: string; author: string; }

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService= inject(ToastService);
  private router      = inject(Router);

  loginForm: FormGroup;
  selectedRole: 'student' | 'recruiter' = 'student';

  showPassword  = signal<boolean>(false);
  isLoading     = signal<boolean>(false);
  currentQuoteIndex = signal<number>(0);
  private quoteInterval: any;

  quotes: CareerQuote[] = [
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Opportunities don't happen, you create them.",        author: "Chris Grosser" },
    { text: "Your talent determines what you can do. Motivation determines how much.",  author: "Lou Holtz" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Action is the foundational key to all success.",       author: "Pablo Picasso" }
  ];

  constructor() {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.currentQuoteIndex.set(Math.floor(Math.random() * this.quotes.length));
    this.quoteInterval = setInterval(() => {
      this.currentQuoteIndex.update(i => (i + 1) % this.quotes.length);
    }, 5000);
  }

  ngOnDestroy() { if (this.quoteInterval) clearInterval(this.quoteInterval); }

  togglePasswordVisibility() { this.showPassword.update(v => !v); }

  setRole(role: 'student' | 'recruiter') {
    this.selectedRole = role;
    // Clear email so user enters their own credentials for their role
    this.loginForm.patchValue({ email: '', password: '' });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.toastService.danger('Please enter a valid email and password (min 6 chars).');
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isLoading.set(true);

    this.authService.login$({ email, password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const role = res.role.toLowerCase();

        this.toastService.success(`Welcome back, ${res.name}!`);

        // Role-based redirect
        if (role === 'recruiter') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'Invalid email or password. Please try again.';
        this.toastService.danger(msg);
      }
    });
  }
}
