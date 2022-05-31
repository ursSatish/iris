import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth-interceptor';
import { EnsureHttpsInterceptor } from './ensure-https-interceptor';
import { LoadingInterceptor } from './loading.interceptor';
import { LoggingInterceptor } from './logging.interceptor';
import { UploadInterceptor } from './upload-interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: EnsureHttpsInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true },
];
