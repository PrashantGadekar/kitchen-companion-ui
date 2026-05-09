import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryService, ToastService } from '../../core/services';
import {
  CATEGORY_ICONS,
  type Category,
  type ShoppingListItem,
  type ShoppingListGroup,
} from '../../core/models';

@Component({
  selector: 'app-shopping-list',
  imports: [RouterLink],
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingList {
  private readonly inventoryService = inject(InventoryService);
  private readonly toast = inject(ToastService);

  protected readonly categoryIcons = CATEGORY_ICONS;

  /** Track purchased state locally (not persisted to inventory) */
  private readonly purchasedIds = signal<Set<string>>(new Set());

  protected readonly shoppingItems = computed<ShoppingListItem[]>(() =>
    this.inventoryService.shoppingList().map((item) => ({
      ...item,
      purchased: this.purchasedIds().has(item.inventoryItemId),
    })),
  );

  protected readonly groupedItems = computed<ShoppingListGroup[]>(() => {
    const groups = new Map<Category, ShoppingListItem[]>();
    for (const item of this.shoppingItems()) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return Array.from(groups.entries())
      .map(([category, items]) => ({ category, items }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });

  protected readonly totalCount = computed(() => this.shoppingItems().length);

  protected readonly purchasedCount = computed(
    () => this.shoppingItems().filter((i) => i.purchased).length,
  );

  protected readonly pendingCount = computed(
    () => this.totalCount() - this.purchasedCount(),
  );

  protected readonly progressPercent = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.purchasedCount() / total) * 100);
  });

  protected togglePurchased(item: ShoppingListItem): void {
    this.purchasedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(item.inventoryItemId)) {
        next.delete(item.inventoryItemId);
      } else {
        next.add(item.inventoryItemId);
      }
      return next;
    });
  }

  protected markAllPurchased(): void {
    const allIds = this.shoppingItems().map((i) => i.inventoryItemId);
    this.purchasedIds.set(new Set(allIds));
  }

  protected clearAllPurchased(): void {
    this.purchasedIds.set(new Set());
  }

  protected restockPurchased(): void {
    const purchased = this.shoppingItems().filter((i) => i.purchased);
    const count = purchased.length;
    for (const item of purchased) {
      const inv = this.inventoryService.getItemById(item.inventoryItemId);
      if (inv) {
        this.inventoryService.updateItem(item.inventoryItemId, {
          quantity: inv.minimumThreshold * 2,
        });
      }
    }
    this.purchasedIds.set(new Set());
    this.toast.show(`${count} items restocked`, 'success', 'inventory');
  }

  protected groupPurchasedCount(group: ShoppingListGroup): number {
    return group.items.filter((i) => i.purchased).length;
  }
}
