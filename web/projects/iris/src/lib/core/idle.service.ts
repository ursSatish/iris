import { Injectable } from '@angular/core';
import { identity } from 'ramda';
import {
  from,
  fromEvent,
  Observable,
  Subject,
  Subscription,
  merge,
  interval,
  timer,
  of,
} from 'rxjs';
import {
  bufferTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  scan,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { IrisModels } from '../model/model';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  ping$: Observable<any>;

  /**
   * Events that can interrupts user's inactivity timer.
   */

  protected activityEvents$: Observable<any>;

  protected timerStart$ = new Subject<boolean>();
  protected timeout$ = new Subject<boolean>();
  protected idle$: Observable<any>;
  protected timer$: Observable<any>;

  /**
   * Idle value in seconds.
   * Default equals to 10 minutes.
   */
  protected idle = 600;
  /**
   * timeout value in seconds
   * Default equals to 5 minutes.
   */
  protected timeout = 300;
  /**
   * ping value in seconds.
   * default equals to 2 minutes.
   */
  protected ping = 200;
  /**
   * Timeout status.
   */
  protected isTimeout: boolean;
  /**
   * Timer of user's inactivity is in progress
   */
  protected isInactivityTimer: boolean;
  protected idleSubscription: Subscription;

  constructor(private storeService: StoreService) {
    this.activityEvents$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'resize'),
      fromEvent(document, 'keydown')
    );
    this.idle$ = from(this.activityEvents$);
  }

  /**
   * Start watching for user idle and setup timer and ping.
   */
  startWatching() {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }

    this.idle = +this.storeService.config['SESSION_IDLE'];
    this.timeout = +this.storeService.config['SESSION_TIMEOUT'];
    this.ping = +this.storeService.config['SESSION_PING'];

    //If any of user wvents is not active for idle-seconds when start timer.
    this.idleSubscription = this.idle$
      .pipe(
        bufferTime(5000), // Starting point of detecting of user's inactivity
        filter((arr) => !arr.length && !this.isInactivityTimer),
        tap(() => (this.isInactivityTimer = true)),
        switchMap(() =>
          interval(1000).pipe(
            takeUntil(
              merge(
                this.activityEvents$,
                timer(this.idle * 1000).pipe(
                  tap(() => this.timerStart$.next(true))
                )
              )
            ),
            finalize(() => (this.isInactivityTimer = false))
          )
        )
      )
      .subscribe();
    this.setupTimer(this.timeout);
    this.setupPing(this.ping);
  }

  stopWatching() {
    this.stopTimer();
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }
  stopTimer() {
    this.timerStart$.next(false);
  }

  resetTimer() {
    this.stopTimer();
    this.isTimeout = false;
  }

  /**
   * Return observable for timer's countdown number that emits after idle.
   */

  onTimerStart(): Observable<number> {
    return (
      this,
      this.timerStart$.pipe(
        distinctUntilChanged(),
        switchMap((start) => (start ? this.timer$ : of(null)))
      )
    );
  }

  /**
   * Return observable for timeout is fired.
   */
  onTimeout(): Observable<boolean> {
    return this.timeout$.pipe(
      filter((timeout) => !!timeout),
      tap(() => (this.isTimeout = true)),
      map(() => true)
    );
  }

  getConfigValue(): IrisModels.IdleSessionConfig {
    return {
      idle: this.idle,
      timeout: this.timeout,
      ping: this.ping,
    };
  }

  /**
   * Set config values.
   * @param config ..
   */
  setConfigValues(config: IrisModels.IdleSessionConfig) {
    if (this.idleSubscription && !this.idleSubscription.closed) {
      console.error('Call stopWatching() before set config values');
      return;
    }

    config.idle ? (this.idle = config.idle) : identity(0);
    config.ping ? (this.ping = config.ping) : identity(0);
    config.timeout ? (this.timeout = config.timeout) : identity(0);
  }

  /**
   * Setup timer.
   *
   * counts every seconds and return n+1 and fire timeout for last count.
   * @param timeout Timeout in seconds.
   */

  protected setupTimer(timeout: number) {
    this.timer$ = interval(1000).pipe(
      take(timeout),
      map(() => 1),
      scan((acc, n) => acc + n),
      tap((count) => {
        if (count === timeout) {
          this.timeout$.next(true);
        }
      })
    );
  }

  /**
   * Setup ping
   *
   * pings every ping.seconds only if is not timeout.
   * @param ping ping
   */

  protected setupPing(ping: number) {
    this.ping$ = interval(ping * 1000).pipe(filter(() => !this.isTimeout));
  }
}
