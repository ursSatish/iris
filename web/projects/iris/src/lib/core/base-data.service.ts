import { Injectable, Injector } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { isNil } from 'ramda';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
import { isNilOrEmpty } from './utility';

@Injectable({ providedIn: 'root' })
export abstract class BaseDataService<T> implements Resolve<T> {
  protected cacheService: CacheService;
  protected databaseService: DatabaseService<any>;
  protected logger: LoggerService;

  constructor(protected injector: Injector) {
    this.cacheService = this.injector.get(CacheService);
    this.databaseService = this.injector.get(DatabaseService);
    this.logger = this.injector.get(LoggerService);
    this.logger.info('Initalizing the logger');
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): T | Observable<any> | Observable<never> {
    let id: string | number | null = route.paramMap.get('id');
    id = isNil(id) ? state.url.split('/').reverse()[1] : id;

    if (id) {
      return this.get(id).pipe(
        take(1),
        mergeMap((data) => {
          return data ? of(data) : EMPTY;
        })
      );
    }
  }

  getControllerName = (): string =>
    this.constructor.name.replace('Service', '');
  getCacheKey = (id: any = '', action: string = '') => {
    id = id instanceof Object ? JSON.stringify(id) : id;
    return `RecordID=${id}::${this.getControllerName()}::${action}`;
  };
  getSearchInstance() {}

  get(id: string | number): Observable<T | T[]> {
    // TODO Need to handle cache
    //return this.cacheService.get(this.getCacheKey(id,'GET'), this.databaseService.get(this.getControllerName(), id));
    return this.databaseService.get(this.getControllerName(), id);
  }

  //Note: Observe the return type. It can either return single value or a collection based on te type of call.
  getByParentId(id: string | number): Observable<T | T[]> {
    return this.cacheService.get(
      this.getCacheKey(id, 'GetByParentID'),
      this.databaseService.getByParentID(this.getControllerName(), id)
    );
  }

  post(action: string, payload: any, cache: boolean = true) {
    if (action === 'Save') {
      this.cacheService.clearForEntity(this.getControllerName());
      return this.databaseService.post(
        this.getControllerName(),
        action,
        payload
      );
    }
    if (cache) {
      return this.cacheService.get(
        this.getCacheKey(payload, action),
        this.databaseService.post(this.getControllerName(), action, payload)
      );
    } else {
      return this.databaseService.post(
        this.getControllerName(),
        action,
        payload
      );
    }
  }

  postToController(
    controller: string,
    action: string,
    payload: any,
    cache: boolean = true
  ) {
    if (action === 'Save') {
      return this.databaseService.post(controller, action, payload);
    } else if (action === 'Upload') {
      // this.cacheService.clearForEntity(this.getControllerName());
      if (isNilOrEmpty(controller)) {
        controller = this.getControllerName();
      }
      return this.databaseService.upload(controller, action, payload);
    } else if (action === 'Download') {
      if (isNilOrEmpty(controller)) {
        controller = this.getControllerName();
      }
      return this.databaseService.download(controller, action, payload);
    } else if (action === 'SendEmail') {
      if (isNilOrEmpty(controller)) {
        controller = this.getControllerName();
      }
      return this.databaseService.post(controller, action, payload);
    }

    return cache
      ? this.cacheService.get(
          this.getCacheKey(payload, action),
          this.databaseService.post(controller, action, payload)
        )
      : this.databaseService.post(controller, action, payload);
  }

  save(data: T): Observable<any> {
    return this.databaseService.save(this.getControllerName(), data);

    // return this.cacheService.get(this.getCacheKey(data['id']),this.databaseService.save(this.getControllerName(),data));
  }
  search(criteria: any): Observable<any> {
    return this.cacheService.get(
      this.getCacheKey('Search', JSON.stringify(criteria)),
      this.databaseService.search(this.getControllerName(), criteria)
    );
  }
  delete(): boolean {
    return true;
  }

  parse(entity: T): T {
    return entity;
  }
}
