import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div class="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <span class="material-symbols-outlined text-4xl text-slate-400">{{ icon }}</span>
      </div>
      <h1 class="text-2xl font-bold text-slate-800 mb-2">{{ title }}</h1>
      <p class="text-slate-500 max-w-sm">{{ message }}</p>
      <div class="mt-6 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
        Coming Soon
      </div>
    </div>
  `,
})
export class Placeholder {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = this.route.snapshot.data['title'] ?? 'Coming Soon';
  protected readonly icon = this.route.snapshot.data['icon'] ?? 'construction';
  protected readonly message = this.route.snapshot.data['message'] ?? 'This feature is under development.';
}
