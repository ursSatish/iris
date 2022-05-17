import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { groupBy } from 'ramda';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { UserNotificationService } from './user-notification.service';
import { isNotNilOrEmpty } from './utility';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService<T> {
  baseURL = '';
  protected logger: LoggerService;
  protected http: HttpClient;

  constructor(
    protected injector: Injector,
    @Inject('environment') private Environment,
    private notificationService: UserNotificationService
  ) {
    this.logger = this.injector.get(LoggerService);
    this.http = this.injector.get(HttpClient);
    this.baseURL = Environment.apiRoot;
    this.logger.info('Initalizing the Database Service');
  }

  codeValDataTransform = groupBy((data: any) => {
    return data.Section;
  });

  getAll = (controllerName: string): Observable<T> =>
    this.http.get<T>(`${this.baseURL}/${controllerName}/`);

  get = (controllerName: string, id: string | number): Observable<T> =>
    this.http
      .get<T>(`${this.baseURL}/${controllerName}/${id}`)
      .pipe(
        catchError(this.handleError(`${this.baseURL}/${controllerName}/${id}`))
      );
  getByParentID = (
    controllerName: string,
    id: string | number
  ): Observable<T> =>
    this.http
      .get<T>(`${this.baseURL}/${controllerName}/GetByParentID/${id}`)
      .pipe(
        catchError(
          this.handleError(
            `${this.baseURL}/${controllerName}/GetByParentID/${id}`
          )
        )
      );

  search = (controllerName: string, payload: T): Observable<T[]> =>
    this.http
      .post<T[]>(`${this.baseURL}/${controllerName}/search`, payload)
      .pipe(
        catchError(
          this.handleError(`${this.baseURL}/${controllerName}/search`, payload)
        )
      );

  download = (
    controllerName: string,
    action: string,
    payload: any
  ): Observable<any> =>
    this.http
      .post(`${this.baseURL}/${controllerName}/${action}`, payload, {
        responseType: 'blob',
      })
      .pipe(
        catchError(
          this.handleError(
            `${this.baseURL}/${controllerName}/${action}`,
            payload
          )
        )
      );
  upload = (
    controllerName: string,
    action: string,
    payload: any
  ): Observable<any> =>
    this.http
      .post(`${this.baseURL}/${controllerName}/${action}`, payload, {
        responseType: 'blob',
      })
      .pipe(
        catchError(
          this.handleError(
            `${this.baseURL}/${controllerName}/${action}`,
            payload
          )
        )
      );

  post = (
    controllerName: string,
    action: string,
    payload: any
  ): Observable<any> =>
    this.http
      .post(`${this.baseURL}/${controllerName}/${action}`, payload)
      .pipe(
        catchError(
          this.handleError(
            `${this.baseURL}/${controllerName}/${action}`,
            payload
          )
        )
      );

  save = (controllerName: string, payload: T) =>
    this.http
      .post(`${this.baseURL}/${controllerName}/save`, payload)
      .pipe(
        catchError(
          this.handleError(`${this.baseURL}/${controllerName}/save`, payload)
        )
      );

  private handleError(operation = 'operation', result?: any) {
    return (error: any): Observable<any> => {
      // TODO: send the error to remote logging infrastructure
      // console.error(error); // log to console instead
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by teturning an empty result.
      if (error.status === 404 || error.status === 403) {
        this.notificationService.error(
          `You dont have permission to perform this operation. Please consult Admin`
        );
      } else if (
        error.status === 500 &&
        isNotNilOrEmpty(error.error) &&
        error.error.ErrorType === 'Custom'
      ) {
        this.notificationService.error(error.error.Message);
      } else if (error.status === 400 && isNotNilOrEmpty(error.error)) {
        // this.notificationService.validationErrors(error.error);
        const groupErrorList = this.codeValDataTransform(error.error);
        Object.entries(groupErrorList).forEach(([key, value]) =>
          this.notificationService.validationErrors(value)
        );
      } else {
        this.notificationService.error(
          'Some error occured, please try again later.'
        );
      }
      return throwError(error);
    };
  }
}
