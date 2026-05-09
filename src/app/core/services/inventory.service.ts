import { Injectable, signal, computed } from '@angular/core';
import { InventoryItem, Category, ShoppingListItem } from '../models';
import { MOCK_INVENTORY_ITEMS } from '../data/mock-inventory.data';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly items = signal<InventoryItem[]>(structuredClone(MOCK_INVENTORY_ITEMS));

  readonly allItems = this.items.asReadonly();

  readonly lowStockItems = computed(() =>
    this.items().filter((item) => item.quantity <= item.minimumThreshold),
  );

  readonly outOfStockItems = computed(() => this.items().filter((item) => item.quantity === 0));

  readonly totalItems = computed(() => this.items().length);

  readonly lowStockCount = computed(() => this.lowStockItems().length);

  readonly categoryCounts = computed(() => {
    const counts = new Map<Category, number>();
    for (const item of this.items()) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return counts;
  });

  readonly shoppingList = computed<ShoppingListItem[]>(() =>
    this.lowStockItems().map((item) => ({
      inventoryItemId: item.id,
      name: item.name,
      category: item.category,
      currentQuantity: item.quantity,
      requiredQuantity: item.minimumThreshold - item.quantity,
      unit: item.unit,
      purchased: false,
    })),
  );

  getItemById(id: string): InventoryItem | undefined {
    return this.items().find((item) => item.id === id);
  }

  addItem(item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'createdAt'>): void {
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      lastUpdated: now,
      createdAt: now,
    };
    this.items.update((items) => [...items, newItem]);
  }

  updateItem(id: string, changes: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>): void {
    this.items.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, ...changes, lastUpdated: new Date().toISOString() } : item,
      ),
    );
  }

  deleteItem(id: string): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  consumeItem(id: string, quantity: number): boolean {
    const item = this.getItemById(id);
    if (!item || quantity <= 0 || quantity > item.quantity) {
      return false;
    }
    this.updateItem(id, { quantity: Math.round((item.quantity - quantity) * 1000) / 1000 });
    return true;
  }

  searchItems(query: string, category?: Category): InventoryItem[] {
    let results = this.items();
    if (category) {
      results = results.filter((item) => item.category === category);
    }
    if (query.trim()) {
      const lower = query.toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.category.toLowerCase().includes(lower) ||
          item.storageLocation.toLowerCase().includes(lower),
      );
    }
    return results;
  }
}
