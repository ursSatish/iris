import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { MenusModule } from '@progress/kendo-angular-menu';
import { HasPermissionDirective } from '../directives/has-permission.directive';
import { AccessDeniedComponent } from './access-denied';
import { BreadcrumbComponent } from './breadcrumb';
import { ButtonPalletComponent } from './button-pallet.component';
import { IrisFooterComponent } from './footer-bar.component';
import { GridButtonPalletComponent } from './grid-button-pallet.component';
import { HeaderBarComponent } from './header-bar.component';
import { IdleComponent } from './idle.component';
import { LogoutComponent } from './logout.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { SpinnerComponent } from './spinner.component';
import { MenuComponent } from './menu.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    GridButtonPalletComponent,
    ButtonPalletComponent,
    HeaderBarComponent,
    MenuComponent,
    SpinnerComponent,
    IdleComponent,
    LogoutComponent,
    BreadcrumbComponent,
    AccessDeniedComponent,
    HasPermissionDirective,
    IrisFooterComponent,
  ],
  imports: [
    CommonModule,
    MenusModule,
    ButtonsModule,
    DialogModule,
    RouterModule,
  ],
  exports: [
    PageNotFoundComponent,
    GridButtonPalletComponent,
    ButtonPalletComponent,
    BreadcrumbComponent,
    ButtonsModule,
    HeaderBarComponent,
    MenuComponent,
    IdleComponent,
    LogoutComponent,
    RouterModule,
    AccessDeniedComponent,
    HasPermissionDirective,
    IrisFooterComponent,
  ],
  providers: [],
})
export class IrisCommonModule {}
