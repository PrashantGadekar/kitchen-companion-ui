import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services';
import { ToastService } from '../../../core/services';
import {
  CATEGORIES,
  CATEGORY_ICONS,
  STORAGE_ICONS,
  type Category,
  type InventoryItem,
} from '../../../core/models';
import { ItemFormDialog } from '../item-form-dialog/item-form-dialog';

@Component({
  selector: 'app-inventory-list',
  imports: [FormsModule, ItemFormDialog],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryList {
  protected readonly inventoryService = inject(InventoryService);
  private readonly toast = inject(ToastService);

  protected readonly searchQuery = signal('');
  protected readonly selectedCategory = signal<Category | null>(null);
  protected readonly sortBy = signal<'name' | 'updated' | 'quantity'>('updated');
  protected readonly viewMode = signal<'card' | 'list'>('card');

  protected readonly categories = CATEGORIES;
  protected readonly categoryIcons = CATEGORY_ICONS;
  protected readonly storageIcons = STORAGE_ICONS;

  protected readonly filteredItems = computed(() => {
    let items = this.inventoryService.searchItems(
      this.searchQuery(),
      this.selectedCategory() ?? undefined,
    );

    const sort = this.sortBy();
    items = [...items].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'quantity') return a.quantity - b.quantity;
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    return items;
  });

  protected readonly resultCount = computed(() => this.filteredItems().length);
  protected readonly totalCount = computed(() => this.inventoryService.allItems().length);

  // --- Consume dialog state ---
  protected readonly consumeDialogItem = signal<InventoryItem | null>(null);
  protected readonly consumeAmount = signal(0);

  // --- Add/Edit dialog state ---
  protected readonly showFormDialog = signal(false);
  protected readonly editingItem = signal<InventoryItem | null>(null);

  protected isLowStock(item: InventoryItem): boolean {
    return item.quantity <= item.minimumThreshold && item.quantity > 0;
  }

  protected isOutOfStock(item: InventoryItem): boolean {
    return item.quantity === 0;
  }

  protected toggleCategory(category: Category): void {
    this.selectedCategory.update((current) => (current === category ? null : category));
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
  }

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

  protected stockPercent(item: InventoryItem): number {
    if (item.minimumThreshold === 0) return 100;
    return Math.min(100, Math.round((item.quantity / (item.minimumThreshold * 2)) * 100));
  }

  // --- Consume flow ---
  protected openConsumeDialog(item: InventoryItem, event: Event): void {
    event.stopPropagation();
    this.consumeDialogItem.set(item);
    this.consumeAmount.set(0);
  }

  protected closeConsumeDialog(): void {
    this.consumeDialogItem.set(null);
    this.consumeAmount.set(0);
  }

  protected setQuickConsume(amount: number): void {
    this.consumeAmount.set(amount);
  }

  protected confirmConsume(): void {
    const item = this.consumeDialogItem();
    const amount = this.consumeAmount();
    if (item && amount > 0) {
      this.inventoryService.consumeItem(item.id, amount);
      this.toast.show(`Consumed ${amount} ${item.unit} of ${item.name}`, 'success', 'remove_circle');
      this.closeConsumeDialog();
    }
  }

  protected deleteItem(item: InventoryItem, event: Event): void {
    event.stopPropagation();
    this.inventoryService.deleteItem(item.id);
    this.toast.show(`${item.name} removed`, 'info', 'delete');
  }

  // --- Add/Edit flow ---
  protected openAddDialog(): void {
    this.editingItem.set(null);
    this.showFormDialog.set(true);
  }

  protected openEditDialog(item: InventoryItem, event: Event): void {
    event.stopPropagation();
    this.editingItem.set(item);
    this.showFormDialog.set(true);
  }

  protected closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.editingItem.set(null);
  }

  protected onItemSaved(itemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'createdAt'>): void {
    this.inventoryService.addItem(itemData);
    this.toast.show(`${itemData.name} added to inventory`, 'success', 'add_circle');
    this.closeFormDialog();
  }

  protected onItemUpdated(event: { id: string; changes: Partial<InventoryItem> }): void {
    this.inventoryService.updateItem(event.id, event.changes);
    this.toast.show('Item updated', 'success', 'edit');
    this.closeFormDialog();
  }

  protected getQuickAmounts(item: InventoryItem): number[] {
    const q = item.quantity;
    if (q <= 0) return [];
    if (item.unit === 'kg' || item.unit === 'L') {
      return [0.25, 0.5, 1].filter((a) => a <= q);
    }
    if (item.unit === 'g' || item.unit === 'ml') {
      return [50, 100, 250, 500].filter((a) => a <= q);
    }
    return [1, 2, 3].filter((a) => a <= q);
  }
}
