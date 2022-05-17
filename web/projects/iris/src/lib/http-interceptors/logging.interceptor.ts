import { HttpClient, HttpInterceptor } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';

@Injectable({
  providedIn: 'root',
})
export class LoggingInterceptor implements HttpInterceptor, OnDestroy {
  private subs = new SubSink();

  constructor(private http: HttpClient, private session: SessionSer);
}
