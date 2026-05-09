import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly toasts = signal<Toast[]>([]);

  readonly activeToasts = this.toasts.asReadonly();

  show(message: string, type: Toast['type'] = 'success', icon?: string): void {
    const id = this.nextId++;
    const toast: Toast = {
      id,
      message,
      type,
      icon: icon ?? this.defaultIcon(type),
    };
    this.toasts.update((list) => [...list, toast]);

    setTimeout(() => this.dismiss(id), 3000);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private defaultIcon(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'info': return 'info';
    }
  }
}
