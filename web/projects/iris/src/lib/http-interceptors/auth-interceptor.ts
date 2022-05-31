import {
  HttpClient,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, mergeMap, retry } from 'rxjs/operators';
import { SessionService } from '../core/session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private environment: any;
  constructor(
    public sessionService: SessionService,
    private http: HttpClient
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    req = req.clone({
      headers: req.headers.set(
        'Authorization',
        'Bearer',
        this.sessionService.context.userInfo.bearerToken
      ),
    });

    return next.handle(req).pipe(
      retry(req.url.indexOf('login') !== -1 ? 2 : 0),
      catchError((error) => {
        if (this.isAuthError(error)) {
          return this.sessionService.startSession().then(
            mergeMap(() => {
              req = req.clone({
                headers: req.headers.set(
                  'Authorization',
                  'Bearer',
                  this.sessionService.context.userInfo.bearerToken
                ),
              });
              return next.handle(req);
            })
          );
        } else {
          error.message = this.errorMessage(error);
          throw error;
        }
      })
    );
  }

  isAuthError(error) {
    if (error instanceof HttpErrorResponse) {
      switch ((<HttpErrorResponse>error).status) {
        case 401:
          return true;
      }
    }
  }

  errorMessage(error): string {
    if (error instanceof HttpErrorResponse) {
      switch ((<HttpErrorResponse>error).status) {
        case 401:
          return 'You are UnAuthorized to access';
        case 403:
          return 'You are Forbidden to access';
        case 404:
          return 'Service unavailable, Please contact admin';
        case 500:
          return 'Service unavailable, Please contact admin';
      }
    }
  }
}
