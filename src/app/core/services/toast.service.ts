import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info', duration = 3500) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    this.toastsSignal.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, duration = 3500) {
    this.show(message, 'success', duration);
  }

  warning(message: string, duration = 3500) {
    this.show(message, 'warning', duration);
  }

  danger(message: string, duration = 4000) {
    this.show(message, 'danger', duration);
  }

  info(message: string, duration = 3500) {
    this.show(message, 'info', duration);
  }

  remove(id: string) {
    this.toastsSignal.update(current => current.filter(toast => toast.id !== id));
  }
}
