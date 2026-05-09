import { Category } from './inventory-item.model';

export interface ShoppingListItem {
  inventoryItemId: string;
  name: string;
  category: Category;
  currentQuantity: number;
  requiredQuantity: number;
  unit: string;
  purchased: boolean;
}

export interface ShoppingListGroup {
  category: Category;
  items: ShoppingListItem[];
}
