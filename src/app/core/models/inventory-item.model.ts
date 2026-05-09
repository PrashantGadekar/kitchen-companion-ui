export type Category =
  | 'Grains'
  | 'Lentils'
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy'
  | 'Oils'
  | 'Spices'
  | 'Snacks'
  | 'Other';

export type StorageLocation =
  | 'Kitchen Shelf'
  | 'Fridge'
  | 'Freezer'
  | 'Storage Drum'
  | 'Pantry';

export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'dozen' | 'packet' | 'bottle' | 'box';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: Unit;
  minimumThreshold: number;
  storageLocation: StorageLocation;
  expiryDate?: string;
  notes?: string;
  lastUpdated: string;
  createdAt: string;
}

export const CATEGORIES: Category[] = [
  'Grains',
  'Lentils',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Oils',
  'Spices',
  'Snacks',
  'Other',
];

export const STORAGE_LOCATIONS: StorageLocation[] = [
  'Kitchen Shelf',
  'Fridge',
  'Freezer',
  'Storage Drum',
  'Pantry',
];

export const UNITS: Unit[] = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'packet', 'bottle', 'box'];

export const CATEGORY_ICONS: Record<Category, string> = {
  Grains: '🌾',
  Lentils: '🫘',
  Vegetables: '🥬',
  Fruits: '🍎',
  Dairy: '🥛',
  Oils: '🫒',
  Spices: '🌶️',
  Snacks: '🍪',
  Other: '📦',
};

export const STORAGE_ICONS: Record<StorageLocation, string> = {
  'Kitchen Shelf': '🗄️',
  Fridge: '❄️',
  Freezer: '🧊',
  'Storage Drum': '🛢️',
  Pantry: '🚪',
};
