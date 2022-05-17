import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationError,
  Router,
  Event,
} from '@angular/router';
import { SessionService } from '../core/session.service';
import { StoreService, Breadcrumb } from '../core/store.service';
import { isNilOrEmpty } from '../core/utility';

@Component({
  selector: 'iris-breadcrumb',
  template: `
    <div
      class="col"
      style="padding-top:10px"
      [hidden]="!sessionService.hasUserContext"
    >
      <ol class="breadcrumb">
        <li
          class="breadcrumb-item"
          *ngFor="let item of storeService.breadcrumbs; let i = index"
          [class.active]="i === storeService.breadcrumbs.length - 1"
        >
          <a
            [routeLink]="item.url"
            *ngIf="i !== storeService.breadcrumbs.length - 1"
          >
            {{ item.label }}
          </a>
          <span *ngIf="i === storeService.breadcrumbs.length - 1">
            {{ item.label }}
          </span>
        </li>
      </ol>
    </div>
  `,
})
export class BreadcrumbComponent implements OnInit {
  public IsMenu = false;
  constructor(
    public storeService: StoreService,
    private route: ActivatedRoute,
    public sessionService: SessionService,
    public router: Router
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.sessionService.lastVisitedRoute = event.urlAfterRedirects;
        if (this.sessionService.lastVisitedRoute !== '/') {
          this.IsMenuItem();
          if (this.IsMenu) {
            this.storeService.menu.items.find((menuitem: any) => {
              this.addBreadcrumbs(menuitem);
              if (menuitem.items) {
                menuitem.items.find((item: any) => {
                  this.addBreadcrumbs(item);
                  if (item.items) {
                    item.items.find((subitem: any) => {
                      this.addBreadcrumbs(subitem);
                    });
                  }
                });
              }
            });
          } else {
            //route not in menu
            let breadcrumb: Breadcrumb;
            if (
              this.route.snapshot.children[0] !== undefined &&
              this.route.snapshot.children[0].children[0] !== undefined
            ) {
              breadcrumb = {
                label:
                  this.route.snapshot.children[0].children[0].data[
                    'breadcrumb'
                  ],
                url: this.sessionService.lastVisitedRoute,
              };
              if (this.storeService.breadcrumbs !== undefined) {
                if (
                  this.storeService.breadcrumbs.findIndex(
                    (item) => item.label === breadcrumb.label
                  ) === -1
                ) {
                  this.storeService.breadcrumbs.push(breadcrumb);
                } else {
                  if (
                    this.storeService.breadcrumbs.findIndex(
                      (item) => item.label === breadcrumb.label
                    ) !== -1 &&
                    this.storeService.breadcrumbs.findIndex(
                      (item) => item.url === breadcrumb.url
                    ) === -1
                  ) {
                    this.storeService.breadcrumbs.find(
                      (item: any) => item.label === breadcrumb.label
                    ).url = breadcrumb.url;
                  }

                  if (
                    this.storeService.breadcrumbs.findIndex(
                      (item) => item.url === breadcrumb.url
                    ) <
                    this.storeService.breadcrumbs.length - 1
                  ) {
                    do {
                      this.storeService.breadcrumbs.pop();
                    } while (
                      this.storeService.breadcrumbs.findIndex(
                        (item) => item.url === breadcrumb.url
                      ) <
                      this.storeService.breadcrumbs.length - 1
                    );
                  }
                }
              } else {
                this.storeService.breadcrumbs = [];
                this.storeService.breadcrumbs.push(breadcrumb);
              }
            }
          }
        }
        this.IsMenu = false;
      }
      if (event instanceof NavigationError) {
        // Hide loading indicator

        // Present error to user
        console.log(event.error);
      }
    });
  }

  ngOnInit(): void {}

  private IsMenuItem() {
    if (!isNilOrEmpty(this.storeService.menu)) {
      this.storeService.menu.items.map((menuitem: any) => {
        if (
          menuitem.path === this.sessionService.lastVisitedRoute.slice(1) ||
          menuitem.path === this.sessionService.lastVisitedRoute
        ) {
          this.IsMenu = true;
        }
        if (menuitem.items) {
          menuitem.items.map((item: any) => {
            if (
              item.path === this.sessionService.lastVisitedRoute.slice(1) ||
              item.path === this.sessionService.lastVisitedRoute
            ) {
              this.IsMenu = true;
            }
            if (item.items) {
              item.items.map((SubMenu: any) => {
                if (
                  SubMenu.path ===
                    this.sessionService.lastVisitedRoute.slice(1) ||
                  SubMenu.path === this.sessionService.lastVisitedRoute
                ) {
                  this.IsMenu = true;
                }
              });
            }
          });
        }
      });
    }
  }

  private addBreadcrumbs(item: any) {
    if (
      item.path === this.sessionService.lastVisitedRoute.slice(1) ||
      item.path === this.sessionService.lastVisitedRoute
    ) {
      this.storeService.breadcrumbs = [];
      const breadcrumb: Breadcrumb = {
        label:
          this.sessionService.lastVisitedRoute === item.path
            ? this.route.snapshot.children[0].children[0].data['breadcrumb']
            : item.text,
        url: item.path,
      };
      this.storeService.breadcrumbs.push(breadcrumb);
    }
  }
}
