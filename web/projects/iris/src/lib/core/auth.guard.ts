import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { isNilOrEmpty } from './utility';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private storeService: StoreService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const id = route.params.id;
    const navigatedRoute = state.url.startsWith('/')
      ? state.url.substr(1, state.url.length)
      : state.url;
    if (this.checkPermission(route, id, navigatedRoute)) {
      return true;
    } else {
      this.router.navigate(['/accessdenied']);
      return false;
    }
  }
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.canActivate(route, state);
  }

  checkPermission(route: any, id: any, navigatedRoute: any): boolean {
    if (
      (this.authService.isAuthenticated &&
        this.storeService.routerLinkList.findIndex(
          (link) => link.toUpperCase() === navigatedRoute.toUpperCase()
        ) > -1) ||
      (!isNilOrEmpty(route.params) &&
        this.storeService.routerLinkList.find(
          (link) =>
            link.toUpperCase() ===
            navigatedRoute.toUpperCase().replace('/' + id, '')
        ))
    ) {
      return true;
    }
    return false;
  }
}
