import { Component, OnInit } from '@angular/core';
import { SessionService } from '../core/session.service';
import { StoreService } from '../core/store.service';
import { DatabaseService } from '../core/database.service';
import { UserNotificationService } from '../core/user-notification.service';
import { Router } from '@angular/router';
import { isNilOrEmpty } from '../core/utility';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'iris-header-bar',
  template: ``,
})
export class HeaderBarComponent implements OnInit {
  public headerTitle: string;
  public increment = 0;
  public showDiv = false;
  public showLoginIcon = true;
  payload: { RoleID: any; LOBID: any };
  target: any;
  roleBasedLOBS: any = [];
  roleBasedLOBSID: any = [];
  onSelectionClick = false;
  pageLoadRoleLOBID: any;
  allowUserSettings = false;
  ActiveRole: string;

  constructor(
    public iSession: SessionService,
    public iStore: StoreService,
    private iDBService: DatabaseService<any>,
    private iDialog: UserNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.headerTitle = 'IRIS - Easy way of Development';
    if (this.iSession.hasUserContext) {
      const RoleID = this.iSession.context.userInfo.activeRoleID;

      if (RoleID !== '0') {
        this.SelectRoleBasedLOBS(RoleID).catch(() => {
          console.log('No mapping exists for active role');
        });
      }
    }
  }

  autoCloseForDropdown(event) {
    this.target = event.target;
    if (!this.target.closest('.roleBased-Div')) {
      this.showDiv = false;
    }
  }

  showHideContentDiv(event) {
    this.showDiv = !this.showDiv;
  }

  ChangeDefaultRole(Role) {
    if (Role.ID !== this.iSession.context.userInfo.activeRoleID) {
      this.SelectRoleBasedLOBS(Role.ID)
        .then(() => {
          this.iSession.context.userInfo.activeRole = Role.RoleName;
          this.RoleLOBUpdate();
          this.showDiv = false;
        })
        .catch(() => {
          this.showDiv = false;
          this.iDialog.alert(
            `The selected role (${Role.RoleName}) does not have valid LOB mappings`
          );
        });
    }
  }

  ChangeDefaultLob(LOB) {
    if (LOB.ID !== this.iSession.context.userInfo.activeLOBID) {
      this.payload = {
        RoleID: this.iSession.context.userInfo.activeRoleID,
        LOBID: LOB.ID,
      };
      const boolVal = this.roleBasedLOBS.find((a) => {
        if (a.ID === LOB.ID) {
          return true;
        }
      });
      if (boolVal) {
        this.roleBasedLOBS.map((a) => {
          if (a.ID === LOB.ID) {
            a.Active = true;
          } else {
            a.Active = false;
          }
        });
        this.RoleLOBUpdate();
      } else {
        this.roleBasedLOBS.map((a) => {
          a.ClickEnabledCursor = true;
        });
      }
    }
  }

  public SelectRoleBasedLOBS(RoleID: any): Promise<any> {
    let ActiveLOBID = this.iSession.context.userInfo.activeLOBID;
    if (!isNilOrEmpty(this.pageLoadRoleLOBID)) {
      ActiveLOBID = this.pageLoadRoleLOBID.LOBID;
    }
    const ret = new Promise((resolve, reject) => {
      this.iDBService
        .get('Security/GetSelectedRoleBasedLOB', RoleID)
        .subscribe((data) => {
          if (!isNilOrEmpty(data)) {
            this.roleBasedLOBS = data;
            this.roleBasedLOBSID = [];
            this.roleBasedLOBS.map((a) => {
              this.roleBasedLOBSID.push(a.ID);
            });
            if (this.roleBasedLOBS.length > 1) {
              this.onSelectionClick = true;
              const boolVal = this.roleBasedLOBS.find((a) => {
                if (a.ID === ActiveLOBID) {
                  return true;
                }
              });
              if (boolVal) {
                if (
                  ActiveLOBID !== this.iSession.context.userInfo.activeLOBID
                ) {
                  ActiveLOBID = this.roleBasedLOBS[0].ID;
                }
                this.roleBasedLOBS.map((b) => {
                  if (b.ID === ActiveLOBID) {
                    b.Active = true;
                  } else {
                    b.Active = false;
                  }
                });
              } else {
                ActiveLOBID = this.roleBasedLOBS[0].ID;
                this.roleBasedLOBS[0].Active = true;
              }
            } else {
              this.onSelectionClick = false;
              this.roleBasedLOBS[0].Active = true;
              ActiveLOBID = this.roleBasedLOBS[0].ID;
            }
            this.payload = {
              RoleID,
              LOBID: ActiveLOBID,
            };
            resolve(true);
          } else {
            reject(false);
          }
        });
    });
    return ret;
  }

  redirectTo(url: string) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
    this.ActiveRole = this.iSession.context.userInfo['activeRole'];
  }

  public RoleLOBUpdate() {
    this.iDBService
      .post(
        'security',
        'SaveDefaultOrActiveRoleandLOB',
        JSON.stringify(this.payload)
      )
      .subscribe((data) => {
        this.iSession.context.userInfo.activeRoleID = this.payload.RoleID;
        this.iSession.context.userInfo.activeLOBID = this.payload.LOBID;
        this.iSession.context.userInfo.activeLob = this.roleBasedLOBS[0].Name;
        this.iSession.SetRoleLOB().then((result) => {
          if (result) {
            if (!isNilOrEmpty(this.iStore.menu)) {
              const routerLink = this.iSession.GetRouterLink();
              if (!isNilOrEmpty(routerLink)) {
                this.redirectTo(routerLink);
              } else {
                this.router.navigate(['/Landing'], {
                  skipLocationChange: true,
                });
              }
            } else {
              this.router.navigate(['/Landing'], { skipLocationChange: true });
            }
          }
        });
      });
  }

  redirectToUserProfile() {
    this.router.navigate(['userprofile']);
    this.showDiv = false;
  }

  onLogout() {
    this.iSession.endSession();
    if (environment.production) {
      location.replace(location.origin + '/login/logoff.htm');
    } else {
      this.router.navigate(['logout']);
    }
  }
}
