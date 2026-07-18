import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  
  isMobileMenuOpen = signal<boolean>(false);
  isDarkTheme = signal<boolean>(true);

  ngOnInit() {
    const cached = localStorage.getItem('credx_theme');
    if (cached === 'light') {
      this.isDarkTheme.set(false);
      document.body.classList.add('light-theme');
    } else {
      this.isDarkTheme.set(true);
      document.body.classList.remove('light-theme');
    }
  }

  toggleTheme() {
    this.isDarkTheme.update(val => {
      const next = !val;
      if (next) {
        document.body.classList.remove('light-theme');
        localStorage.setItem('credx_theme', 'dark');
      } else {
        document.body.classList.add('light-theme');
        localStorage.setItem('credx_theme', 'light');
      }
      return next;
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
