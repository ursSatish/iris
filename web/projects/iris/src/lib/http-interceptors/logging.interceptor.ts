import { formatDate } from '@angular/common';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { takeLast } from 'ramda';
import { identity, finalize, tap } from 'rxjs';
import { CatchService } from '../core/cache.service';
import { DatabaseService } from '../core/database.service';
import { SessionService } from '../core/session.service';
import { guid } from '../core/utility';
import { dateFormat, isNilOrEmpty } from '../core/utility';
import { StoreService } from '../core/store.service';
import { GenericService } from '../core/generic.service';
import { SubSink } from 'subsink';
import { error } from '@angular/compiler/src/util';

@Injectable({
  providedIn: 'root',
})
export class LoggingInterceptor implements HttpInterceptor, OnDestroy {
  private subs = new SubSink();

  constructor(
    private http: HttpClient,
    private session: SessionService,
    private genericService: GenericService,
    private DB: DatabaseService<any>,
    private storeService: StoreService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const started = Date.now();
    let ok: string;
    let response: any;
    let operationurl: string;
    return next.handle(req).pipe(
      tap(
        (event) => {
          ok = 'succeeded';
          event instanceof HttpResponse
            ? (response = JSON.stringify(event.body))
            : identity(0);
        },
        (error) => {
          ok = 'failed';
          event instanceof HttpResponse
            ? (response = JSON.stringify(error))
            : identity(0);
          throw error;
        }
      ),
      finalize(() => {
        operationurl = takeLast(2, req.url.split('/')).join('/');
        if (
          operationurl === 'Generic/Search' ||
          operationurl === 'Generic/Save' ||
          operationurl == 'Generic/Get'
        ) {
          operationurl = req.body.entity + '/' + req.body.action;
        }
        if (
          this.session.excludedURLs.include(operationurl) ||
          operatorurl.includes('PageBuilder')
        ) {
          if (
            this.DB.baseURL + operationurl !==
            this.DB.baseURL + 'Admin/Log'
          ) {
            const elapsed = Date.now() - started;
            if (this.session.hasUserContext) {
              const body = this.getResponseBody(
                req,
                ok,
                elapsed,
                response,
                started
              );
              this.session.SessioncontextLog.push(body);
            }
          }
        } else {
          if (this.storeService.config) {
            if (
              ok === 'succeeded' ||
              this.storeService.config['IsLoggingenabled'] === 'true'
            ) {
              const elapsed = Date.now() - started;
              if (!(this.storeService.config['IsLoggingenabled'] === 'true')) {
                response = '';
              }
              if (this.session.hasUserContext) {
                const body = this.getResponseBody(
                  req,
                  ok,
                  elapsed,
                  response,
                  started
                );
                this.subs.sink = this.genericService
                  .post('Admin', 'Log', { model: { Log: body } })
                  .subscribe((res) => res);
              }
            }
          }
        }
      })
    );
  }

  private getResponseBody(
    req: HttpRequest<any>,
    ok: string,
    elapsed: number,
    response: any,
    started: number
  ) {
    let param: string[] = [];
    const userActiveRoleID = isNilOrEmpty(
      this.session.context.userInfo.activeRoleID
    )
      ? guid
      : this.session.context.userInfo.activeRoleID;
    const userActiveLOBID = isNilOrEmpty(
      this.session.context.userInfo.activeLOBID
    )
      ? guid
      : this.session.context.userInfo.activeLOBID;

    if (req.method === 'GET' && req.urlWithParams.split('/').length > 6) {
      param = req.urlWithParams.split('');
    }
    return {
      ID: -1,
      UserID: this.session.context.userInfo['userID'],
      ActiveRoleID: userActiveRoleID,
      ActiveLOBID: userActiveLOBID,
      MethodType: req.method,
      Params:
        req.method === 'POST' ? JSON.stringify(req.body) : param.toString(),
      Request_URL: req.urlWithParams,
      Status: ok,
      Time_Elapsed_MS: elapsed,
      Response: response,
      StartTime: formatDate(started, dateFormat, 'en-US', 'UTC'),
      EndTime: formatDate(Date.now(), dateFormat, 'en-US', 'UTC'),
    };
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
