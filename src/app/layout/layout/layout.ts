import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NavItem } from '../../core/models';
import { InventoryService } from '../../core/services';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  private readonly inventoryService = inject(InventoryService);
  private readonly router = inject(Router);

  protected readonly sidenavOpen = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Inventory', icon: 'inventory', route: '/inventory' },
    { label: 'Shopping List', icon: 'shopping_cart', route: '/shopping-list' },
    { label: 'Analytics', icon: 'analytics', route: '/analytics' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  protected readonly bottomNavItems = computed(() => this.navItems.slice(0, 4));

  protected readonly shoppingBadge = computed(() => {
    const count = this.inventoryService.lowStockCount();
    return count > 0 ? count : undefined;
  });

  protected toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }

  protected closeSidenav(): void {
    this.sidenavOpen.set(false);
  }

  protected onNavClick(): void {
    this.closeSidenav();
  }

  protected logout(): void {
    this.closeSidenav();
    this.router.navigate(['/login']);
  }
}
