import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SessionService } from '../core/session.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'iris-idle-session',
  template: `
    <kendo-dialog
      title="Session Timeout warning"
      *ngIf="iSession.context.showSessionTimeoutDialog"
      [minWidth]="400"
      [width]="400"
      [height]="250"
    >
      <div class="col-sm-12">
        <div class="card">
          <div class="card-header">Session Timeout</div>
          <div class="card-body">
            You will be logger out in {{ iSession.remSeconds }} seconds
            <div class="d-flex align-items-center p-2">
              <button kendoButton class="mx-1" (click)="onContinueSession()">
                Continue</button
              >&nbsp;
              <button kendoButton class="mx-1" (click)="onLogout()">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </kendo-dialog>
  `,
})
export class IdleComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  constructor(public iSession: SessionService, private router: Router) {}

  ngOnInit(): void {
    this.subs.sink = this.iSession.idleService.onTimeout().subscribe(() => {
      this.iSession.endSession();
      if (environment.production) {
        location.replace(location.origin + 'login/logoff.htm');
      } else {
        this.router.navigate(['logout']);
      }
    });
  }

  onContinueSession() {
    this.iSession.context.showSessionTimeoutDialog = false;
    this.iSession.idleService.resetTimer();
  }

  onLogout() {
    this.iSession.endSession();
    if (environment.production) {
      location.replace(location.origin + 'login/logoff.htm');
    } else {
      this.router.navigate(['logout']);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
