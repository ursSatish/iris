import { HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { LoadingService } from '../core/loading.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingInterceptor implements HttpInterceptor {
  private requests: any[] = [];
  constructor(private loadingService: LoadingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    if (request.url.indexOf('Admin/Log') === -1) {
      this.requests.push(request);
      this.loadingService.setLoading(true);
    }
    return next.handle(request).pipe(
      tap(res => {
        if (res instanceof HttpResponse) {
          if (request.url.indexOf('Admin/Log') === -1) {
            this.removeRequest(request);
          }
        }
      }),
      catchError(err => {
        if (request.url.indexOf('Admin/Log') === -1) {
          this.removeRequest(request);
        }
        throw err;
      })
    );
  }
  removeRequest(req: any) {
    const reqIndex = this.requests.indexOf(req);
    if (reqIndex >= 0) {
      this.requests.splice(reqIndex, 1);
    }
    this.loadingService.setLoading(this.requests.length > 0);
  }
}
