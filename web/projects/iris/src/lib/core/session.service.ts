import { Injectable, OnDestroy } from '@angular/core';
import { forEach, groupBy, keys } from 'ramda';
import { forkJoin, identity } from 'rxjs';
import { SubSink } from 'subsink';
import { LoggerService } from '../logger/logger.service';
import { IrisModels } from '../model/model';
import { DatabaseService } from './database.service';
import { GenericFrameworkService } from './generic-framework.service';
import { IdleService } from './idle.service';
import { StoreService } from './store.service';
import {
  isNilOrEmpty,
  toDomainMap,
  toConfigMap,
  FillRouterList,
} from './utility';

@Injectable({ providedIn: 'root' })
export class SessionService implements OnDestroy {
  private subs = new SubSink();

  constructor(
    private genericFrameworkService: GenericFrameworkService,
    public idleService: IdleService,
    private storeService: StoreService,
    private logger: LoggerService,
    private iDBService: DatabaseService<any>
  ) {}

  excludedURLs: string[] = [];
  hasUserContext = false;
  remSeconds: number;
  context: IrisModels.IrisContext = new IrisModels.IrisContext();
  idleConfig: IrisModels.IdleSessionConfig = new IrisModels.IdleSessionConfig();
  SessioncontextLog: any[] = [];
  lastVisitedRoute: string;
  routerLinkList: string[] = [];

  codeValDataTransform = groupBy((data: any) => {
    return data.CategoryCodeID;
  });

  public LogSessionContext() {
    if (this.storeService.config) {
      if (
        this.storeService.config['IsLogginEnabled'] === 'true' &&
        this.hasUserContext
      ) {
        this.subs.sink = this.genericFrameworkService
          .save(this.SessioncontextLog)
          .subscribe((res) => {
            this.SessioncontextLog = [];
          });
      }
    }
  }

  public startSession(): Promise<any> {
    this.excludedURLs.push('Admin.Log');
    const ret = new Promise((resolve, reject) => {
      this.subs.sink = this.iDBService
        .post('security', 'login', null)
        .subscribe((resp) => {
          if (resp.isAuthenticated) {
            this.logger.log('Initialising the app');
            this.context.userInfo = resp;
            this.hasUserContext = true;
            this.GetAppData().then((result) => {
              if (result) {
                resolve(true);
              }
            });
          }
        });
    });
    return ret;
  }
  private toDomainMap(data) {
    forEach((e) => this.storeService.domainMap.set(e['ID'], e['value']), data);
  }
  private toConfigMap(data) {
    forEach((e) => this.storeService.configMap.set(e['ID'], e['value']), data);
  }
  startWatching(): any {
    this.idleService.stopWatching();
    this.idleService.setConfigValues(this.idleConfig);
    this.idleService.startWatching();
    const timeout = this.idleService.getConfigValue().timeout;
    // Start watching when user idle is starting.
    this.subs.sink = this.idleService.onTimerStart().subscribe(
      (count) => {
        count === 1
          ? (this.context.showSessionTimeoutDialog = true)
          : identity(0);
        this.remSeconds = timeout - count;
      },
      (error) => {
        console.error(error);
      },
      () => {
        console.log('completed');
      }
    );

    // Start watch when time is up.
    this.subs.sink = this.idleService.onTimeout().subscribe(() => {
      console.log('Time is up!');
      this.endSession();
    });
  }
  public endSession() {
    this.context = new IrisModels.IrisContext();
    this.hasUserContext = false;
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  SetRoleLOB(): Promise<any> {
    const ret = new Promise((resolve, reject) => {
      this.iDBService
        .post('security', 'generateTokenByUserContext', null)
        .subscribe(
          (resp) => {
            this.context.userInfo = resp;
            this.hasUserContext = true;
            this.GetAppData().then((result) => {
              if (result) {
                resolve(true);
              }
            });
          },
          (error) => {
            console.log('Error occured while changing role');
          }
        );
    });
    return ret;
  }

  GetAppData(): Promise<any> {
    const ret = new Promise((resolve, reject) => {
      this.subs.sink = forkJoin([
        this.genericFrameworkService.search({}, 'Domain', false),
        this.genericFrameworkService.search({}, 'AppSettings', false),
        this.genericFrameworkService.search({}, 'Menu', false),
        this.genericFrameworkService.search({}, 'RoleApiPermissions', false),
      ]).subscribe(
        ([domain, appSettings, menu, ApiPermissions]) => {
          this.storeService.domain = this.codeValDataTransform(domain.Domain);
          this.storeService.domainMap = toDomainMap(domain.Domain);
          this.storeService.configMap = toConfigMap(appSettings.AppSettings);
          this.storeService.config = appSettings.AppSettings.reduce(
            (obj, item) => ((obj[item.ConfigKey] = item.ConfigKey), obj),
            {}
          );
          this.storeService.menu = menu;
          this.storeService.permissions = ApiPermissions;
          this.storeService.routerLinkList = FillRouterList(
            this.storeService.menu,
            true
          );
          this.logger.log('Initialized the domain data');
          this.startWatching();
          resolve(true);
        },
        (error) => {
          console.log(
            'Error occured while getting Domain, Menu and App Settings'
          );
        }
      );
    });
    return ret;
  }
  GetRouterLink() {
    let routerLink: string;
    // Returns 1st menu item as routerlink of route available.
    // else returns first child item available for first menu item.

    for (const menu in this.storeService.menu['items']) {
      if (
        !isNilOrEmpty(this.storeService.menu['items'][menu].path) &&
        isNilOrEmpty(this.storeService.menu['items'][menu].items)
      ) {
        return this.storeService.menu['items'][menu].path;
      } else if (
        !isNilOrEmpty(this.storeService.menu['items'][menu].items) &&
        isNilOrEmpty(routerLink)
      ) {
        for (const menuitems in this.storeService.menu['items'][menu].items) {
          if (
            !isNilOrEmpty(this.storeService.menu['items'][menu]['items']) &&
            isNilOrEmpty(routerLink)
          ) {
            routerLink =
              this.storeService.menu['items'][menu]['items'][menu].path;
          }
        }
      }
    }
    return routerLink;
  }
}
