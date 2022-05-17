import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'iris-menu',
  template: `
    <kendo-menu
      [items]="storeService.menu['items']"
      (select)="onSelect($event)"
    ></kendo-menu>
    <iris-breadcrumb></iris-breadcrumb>
  `,
})
export class MenuComponent {
  constructor(private router: Router, public storeService: StoreService) {}

  public onSelect({ item }): void {
    if (!item.items) {
      this.router.navigate([item.path]);
    }
  }
}
