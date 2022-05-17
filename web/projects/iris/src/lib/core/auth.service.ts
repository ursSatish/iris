import { Injectable, Injector, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import isNil from 'ramda/es/isNil';
import { IrisModels } from '../model/model';
import { BaseDataService } from './base-data.service';
import { SubSink } from 'subsink';
@Injectable({ providedIn: 'root' })
export class AuthService extends BaseDataService<any> implements OnDestroy {
  private subs = new SubSink();
  private context: IrisModels.Context;
  constructor(public injector: Injector, private router: Router) {
    super(injector);
  }
  login(user: any) {
    this.subs.sink = this.post('legan', user, false).subscribe((uc) => {
      if (uc.authenticated) {
        this.context = new IrisModels.Context(
          uc.lanId,
          uc.firstName,
          uc.lastName,
          uc.bearerToken,
          uc.authenticated
        );
        this.router.navigate(['/dashboard']);
      } else {
      }
    });
  }
  isAuthenticated(): boolean {
    const ret: boolean =
      isNil(this.context) || !this.context.authenticated ? false : true;
    return ret;
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
