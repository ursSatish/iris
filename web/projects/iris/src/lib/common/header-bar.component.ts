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
  template: `
    <div class="container-fluid bg-wells text-white">
      <div class="row p-2 align-items-center header_border">
        <div class="col-md-2">
          <img src="assets/logo.jpg" />
        </div>
        <div class="col-md-6 mr-auto">
          <span style="font-size:24px; font-family:Georgia;">{{
            headerTitle
          }}</span>
          <div class="text-uppercase font-weight-light">
            <span style="font-size: 12px; font-family:Georgia;">{{
              iSession.context.userInfo.activeRole
            }}</span>
          </div>
        </div>
        <div
          *ngIf="iSession.context.userInfo.isAuthenticated"
          class="col-md-3 col-md-offset-3 d-flex align-items-center justify-content-end z-index"
        >
          <div class="col-md-12">
            <div class="row colorYellow">
              <div
                class="col-md-3 float-left"
                [ngClass]="{ 'change-Style': showDiv }"
              >
                <img
                  src="{{
                    iSession.context.userInfo.userProfileImage ||
                      'assets/user.jpg'
                  }}"
                  class="rounded-circle border img-border-circle border-warning float-right"
                />
              </div>
              <div
                [ngClass]="{ 'change-text': showDiv }"
                class="col-md-9 float-right userInfo"
              >
                <small
                  ><b> Welcome {{ iSession.context.userInfo.userName }}</b>
                  <br />
                  Role: {{ iSession.context.userInfo.activeRole }},{{
                    iSession.context.userInfo.activeLob
                  }}
                  <div
                    style="display:inline"
                    kendoTooltip
                    class="k-icon k-i-arrow-chevron-down Unicode: e015"
                    tooltipEvent="hover"
                    title="change role"
                    (click)="showHideContentDiv($event)"
                  ></div>
                  <br *ngIf="iSession.context.userInfo.isAuthenticated" />
                  LastLogged On:
                  {{
                    this.iSession.context.userInfo.lastLogin
                      | date: 'MM-dd-yyyy hh:mm a'
                  }}
                </small>
              </div>
            </div>
            <div
              *ngIf="showDiv && iSession.context.userInfo.userName"
              class="roleBased-Div col-md-12"
              (window:mouseup)="autoCloseForDropdown($event)"
            >
              <h6>Roles</h6>
              <div *ngIf="iSession.context.userInfo">
                <div *ngFor="let role of iSession.context.userInfo.userRoles">
                  <ul>
                    <li (click)="ChangeDefaultRole(role)" [id]="role.ID">
                      <span
                        [ngClass]="{k-icon k-i-checkmark cursor-point': role.ID == isession.context.userInfo.activeRoleID}"
                      >
                      </span>
                      <span
                        [ngClass]="{role-condition': role.ID != isession.context.userInfo.activeRoleID}"
                        >{{ role.RoleName }}
                        <small
                          class="colorRed"
                          *ngIf="
                            role.ID == iSession.context.userInfo.defaultRoleID
                          "
                          >(<b>Default</b>)</small
                        >
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <hr />
              <h6>Function</h6>
              <div *ngIf="iSession.context.userInfo && roleBasedLOBSID">
                <ul>
                  <div
                    *ngFor="let lob of iSession.context.userInfo.userLOBS"
                    class="container-fluid"
                  >
                    <li
                      (click)="
                        onSelectionClick
                          ? ChangeDefaultLob(lob)
                          : $event.stopPropagation()
                      "
                      [id]="lob.ID"
                      class="row"
                      [ngClass]="{
                        cursorNoDrop:
                          roleBasedLOBS.length === 1 ||
                          roleBasedLOBSID.indexof(lob.ID) === -1
                      }"
                    >
                      <div class="col-xs-2" style="width: 18px">
                        <div *ngFor="let roleLOB of roleBasedLOBS">
                          <div *ngIf="lob.ID === roleLOB.ID">
                            <span
                              [ngClass]="{
                                'k-icon k-i-check k-i-checkmark cursor-point':
                                  lob.ID == roleLOB.ID && roleLOB.Active
                              }"
                            ></span>
                          </div>
                        </div>
                      </div>
                      <span class=" col-xs-3">{{ lob.LOBName }}</span>
                    </li>
                  </div>
                </ul>
              </div>
              <hr />
              <div
                class="logoutDiv col-md-2 d-flex align-items-center justify-content-between p-2"
              >
                <span class="cursor-point" title="Sign Out" (click)="onLogout()"
                  >Logout
                </span>
                &nbsp;&nbsp;
                <span
                  *ngIf="iSession.context.userInfo.isAuthenticated"
                  aria-hidden="true"
                  kendoTooltip
                  title="Sign Out"
                  tooltipEvent="hover"
                  class="k-icon k-i-logout cursor-point"
                  (click)="onLogout()"
                ></span>
                <span
                  *ngIf="allowUserSettings"
                  ariar-hidden="true"
                  kendoTooltip
                  title="User Profile"
                  tooltipEvent="hover"
                  class="k-icon k-i-gear cursor-point ml-3 mt-1"
                  (click)="redirectToUserProfile()"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <iris-spinner></iris-spinner>
  `,
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
