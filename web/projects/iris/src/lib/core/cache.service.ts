import { Injectable } from '@angular/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { clone } from 'ramda';

interface CacheContent {
  expiry: number;
  value: any;
}

/**
 * Cache Service is an observables based in-memory cache implementation
 * keeps track of in-flight observables and sets a default expiry for cached values
 * @export
 */
@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache: Map<string, CacheContent> = new Map<string, CacheContent>();
  private inFlightObservables: Map<string, Subject<any>> = new Map<
    string,
    Subject<any>
  >();
  readonly DEFAULT_MAX_AGE: number = 100;

  /**
   * Gets the value from cache if the key is provided.
   * If no value exists in cache, then check if the same call exists
   * in flight, if so return the subject. If not create a new
   * Subject in FlightObservable and return the source observable.
   */
  get(
    key: string,
    fallback?: Observable<any>,
    maxAge?: number
  ): Observable<any> | Subject<any> {
    if (this.hasValidCachedValue(key)) {
      console.log(`%cGetting from cache ${key}`, 'color: green');
      return of(clone(this.cache.get(key)?.value));
    }

    if (!maxAge) {
      maxAge = this.DEFAULT_MAX_AGE;
    }

    if (this.inFlightObservables.has(key)) {
      return this.inFlightObservables.get(key);
    } else if (fallback && fallback instanceof Observable) {
      this.inFlightObservables.set(key, new Subject());
      console.log(`%cCalling api for ${key}`, 'color: purple');
      return fallback
        .pipe(
          tap((value) => {
            this.set(key, value, maxAge);
          })
        )
        .pipe(
          catchError((e: any) => {
            // `fallback` are crashed
            // crashed flight is terrible, it's better to clean it up...
            this.inFlightObservables.delete(key);
            // and when we have done our job, it's good idea to le tthe other s know this event.
            // maybe they have stuffs need to be done too.
            return throwError(e);
          })
        );
    } else {
      return throwError('Requested key is not available in Cache');
    }
  }

  clearForEntity(entity: any) {
    this.cache.forEach((value, key, map) =>
      key.includes(entity) ? map.delete(key) : null
    );
  }

  clear() {
    console.log(`Clearing the complete Cache`);
    this.cache = new Map<string, CacheContent>();
  }

  /**
   * Sets the value with key in the cache
   * Notifies all observers of the new value
   */
  set(key: string, value: any, maxAge: number = this.DEFAULT_MAX_AGE): void {
    this.cache.set(key, { value, expiry: Date.now() + maxAge });
    this.notifyInFlightObservers(key, value);
  }

  /**
   * Checks if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  dumpCache() {
    console.log(this.cache);
  }

  /**
   * Publishes the value to all observers of the given
   * in progress observables if observers exist.
   */
  private notifyInFlightObservers(key: string, value: any): void {
    if (this.inFlightObservables.has(key)) {
      const inFlight = this.inFlightObservables.get(key);
      const observersCount = inFlight?.observers.length;
      if (observersCount) {
        console.log(
          `%cNotifying ${inFlight.observers.length} flight subscribers for ${key}`,
          'color:blue'
        );
        inFlight.next(value);
      }
      inFlight?.complete();
      this.inFlightObservables.delete(key);
    }
  }

  /**
   * checks if the key exists and has not expired
   */

  private hasValidCachedValue(key: string): boolean {
    if (this.cache.has(key)) {
      if (this.cache.get(key)?.expiry < Date.now()) {
        this.cache.delete(key);
        return false;
      }
      return true;
    } else {
      return false;
    }
  }
}
