import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../core/services';
import { CATEGORY_ICONS, STORAGE_ICONS } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly inventoryService = inject(InventoryService);

  protected readonly totalItems = this.inventoryService.totalItems;
  protected readonly lowStockCount = this.inventoryService.lowStockCount;
  protected readonly lowStockItems = this.inventoryService.lowStockItems;
  protected readonly allItems = this.inventoryService.allItems;

  protected readonly outOfStockCount = computed(
    () => this.inventoryService.outOfStockItems().length,
  );

  protected readonly categoryCounts = this.inventoryService.categoryCounts;

  protected readonly categoryBreakdown = computed(() => {
    const counts = this.categoryCounts();
    return Array.from(counts.entries())
      .map(([category, count]) => ({
        category,
        count,
        icon: CATEGORY_ICONS[category],
      }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly expiringItems = computed(() => {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return this.allItems()
      .filter((item) => {
        if (!item.expiryDate) return false;
        const expiry = new Date(item.expiryDate);
        return expiry <= threeDaysLater && expiry >= now;
      })
      .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
  });

  protected readonly storageBreakdown = computed(() => {
    const counts = new Map<string, number>();
    for (const item of this.allItems()) {
      counts.set(item.storageLocation, (counts.get(item.storageLocation) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([location, count]) => ({
        location,
        count,
        icon: STORAGE_ICONS[location as keyof typeof STORAGE_ICONS] ?? '📦',
      }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly recentlyUpdated = computed(() =>
    [...this.allItems()]
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5),
  );

  protected readonly categoryIcons = CATEGORY_ICONS;

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  protected daysUntilExpiry(dateStr: string): number {
    const now = new Date();
    const expiry = new Date(dateStr);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}
