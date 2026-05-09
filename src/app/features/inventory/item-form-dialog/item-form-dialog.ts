import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  CATEGORIES,
  STORAGE_LOCATIONS,
  UNITS,
  CATEGORY_ICONS,
  type InventoryItem,
  type Category,
  type StorageLocation,
  type Unit,
} from '../../../core/models';

@Component({
  selector: 'app-item-form-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './item-form-dialog.html',
  styleUrl: './item-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly item = input<InventoryItem | null>(null);
  readonly closed = output<void>();
  readonly saved = output<Omit<InventoryItem, 'id' | 'lastUpdated' | 'createdAt'>>();
  readonly updated = output<{ id: string; changes: Partial<InventoryItem> }>();

  protected readonly categories = CATEGORIES;
  protected readonly storageLocations = STORAGE_LOCATIONS;
  protected readonly units = UNITS;
  protected readonly categoryIcons = CATEGORY_ICONS;

  protected readonly isEditMode = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['Grains' as Category, Validators.required],
    quantity: [1, [Validators.required, Validators.min(0)]],
    unit: ['kg' as Unit, Validators.required],
    minimumThreshold: [0.5, [Validators.required, Validators.min(0)]],
    storageLocation: ['Kitchen Shelf' as StorageLocation, Validators.required],
    expiryDate: [''],
    notes: [''],
  });

  ngOnInit(): void {
    const existingItem = this.item();
    if (existingItem) {
      this.isEditMode.set(true);
      this.form.patchValue({
        name: existingItem.name,
        category: existingItem.category,
        quantity: existingItem.quantity,
        unit: existingItem.unit,
        minimumThreshold: existingItem.minimumThreshold,
        storageLocation: existingItem.storageLocation,
        expiryDate: existingItem.expiryDate ?? '',
        notes: existingItem.notes ?? '',
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const itemData = {
      name: val.name.trim(),
      category: val.category,
      quantity: val.quantity,
      unit: val.unit,
      minimumThreshold: val.minimumThreshold,
      storageLocation: val.storageLocation,
      expiryDate: val.expiryDate || undefined,
      notes: val.notes || undefined,
    };

    const existing = this.item();
    if (existing) {
      this.updated.emit({ id: existing.id, changes: itemData });
    } else {
      this.saved.emit(itemData);
    }
  }

  protected close(): void {
    this.closed.emit();
  }

  protected setCategory(cat: Category): void {
    this.form.controls.category.setValue(cat);
  }

  protected setStorage(loc: StorageLocation): void {
    this.form.controls.storageLocation.setValue(loc);
  }

  protected setUnit(unit: Unit): void {
    this.form.controls.unit.setValue(unit);
  }

  protected get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }
}
