import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, type Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-info]="toast.type === 'info'"
          role="status"
        >
          <span class="material-symbols-outlined toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-dismiss" (click)="dismiss(toast.id)" aria-label="Dismiss">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .toast-container {
      @apply fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60]
             flex flex-col-reverse gap-2 items-center w-full max-w-sm px-4;
    }

    .toast {
      @apply w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl
             text-white text-sm font-medium shadow-lg
             animate-[slideUp_0.25s_ease-out];
    }

    .toast-success {
      @apply bg-emerald-600;
    }

    .toast-error {
      @apply bg-red-600;
    }

    .toast-info {
      @apply bg-blue-600;
    }

    .toast-icon {
      @apply text-lg flex-shrink-0;
    }

    .toast-message {
      @apply flex-1;
    }

    .toast-dismiss {
      @apply flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
             hover:bg-white/20 transition-colors;
    }

    @keyframes slideUp {
      from { transform: translateY(1rem); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
})
export class ToastContainer {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.activeToasts;

  protected dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
