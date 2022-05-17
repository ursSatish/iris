import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { GenericService } from './generic.service';
import { SessionService } from './session.service';
import { isNilOrEmpty } from './utility';
import { identity, timer } from 'rxjs';
import { isEmpty } from 'ramda';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  public angularErrors: Array<any> = [];
  logweberrorsubscribe: any;
  private subscriber = 0;
  private router: Router | undefined;
  constructor(
    private injector: Injector,
    private genericService: GenericService,
    private sessionService: SessionService,
    @Inject('environment') private Environment: any
  ) {}
  handleError(error: any): void {
    // If it is Http failure response -> API error which already logged so BYPASSING
    let errorMessage = error.message;
    let errorStack = error.stack;
    if (
      error instanceof HttpErrorResponse &&
      (<HttpErrorResponse>error).status === 500
    ) {
      console.log(error);
    } else {
      if (error instanceof HttpErrorResponse) {
        errorMessage = isNilOrEmpty(error.error) ? error.message : error.error;
        errorStack =
          'API url:' + error.url + ', Error Status: ' + error.statusText;
      }

      if (this.subscriber === 0) {
        this.logWebErrors();
        this.subscriber = 1;
      }
      this.router = this.injector.get(Router);
      const errordata = {
        Message: errorMessage,
        StackTrace: errorStack,
        Source: 'WEB',
        WebURL: this.router.url,
      };
      this.angularErrors.push(errordata);
    }
  }

  private logWebErrors() {
    const logweberrorsinterval = timer(
      this.Environment.errorLogStartTime,
      this.Environment.errorLogIntervel
    );
    this.logweberrorsubscribe = logweberrorsinterval.subscribe((val) => {
      if (!isEmpty(this.angularErrors)) {
        const action = this.sessionService.hasUserContext
          ? 'LogExceptions'
          : 'LogExceptionsWithOutContext';
        this.genericService.post('Admin', action, this.angularErrors).subscribe(
          () => {
            this.angularErrors = [];
          },
          () => {
            !this.logweberrorsubscribe.closed
              ? this.logweberrorsubscribe.unsubscribe()
              : identity(0);
          }
        );
      }
    });
  }
}
