import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { SessionService } from '../core/session.service';
import { StoreService } from '../core/store.service';

@Directive({
  selector: '[hasPermission]',
})
export class HasPermissionDirective implements OnInit {
  includeBtnList = [
    { name: 'SEARCH', value: 'SEARCH' },
    { name: 'SAVE', value: 'SAVE' },
    { name: 'EDIT_DIALOG', value: 'GET' },
    { name: 'EDIT_REDIRECT', value: 'GET' },
    { name: 'INLINE_EDIT', value: 'GET' },
    { name: 'ADD_DIALOG', value: 'GET' },
    { name: 'CUSTOM_DIALOG', value: 'GET' },
    { name: 'ChangeOwner', value: 'GET' },
    { name: 'TaskConfiguration', value: 'GET' },
  ];
  @Input() buttonCode: string;
  @Input() entity: string;
  @Input() WorkflowState: number;
  constructor(
    private elementRef: ElementRef,
    private sessionService: SessionService,
    private storeService: StoreService
  ) {}
  ngOnInit() {
    let accessBtn = false;
    let methodType = null;
    const methodTypeIndex = this.includeBtnList.findIndex(
      (item) => item.name.toUpperCase() === this.buttonCode.toUpperCase()
    );
    if (methodTypeIndex > -1) {
      methodType = this.includeBtnList[methodTypeIndex].value;
    }

    this.storeService.permissions.map((e) => {
      if (
        (e.OpenAccess === 1 ||
          e.RoleName === this.sessionService.context.userInfo.activeRole) &&
        methodType != null &&
        e.Name.toUpperCase().startWith(this.entity.toUpperCase()) &&
        e.Name.toUpperCase().endsWith(methodType.toUpperCase())
      ) {
        if (
          this.WorkflowState == null ||
          e.WorkflowStateID === this.WorkflowState ||
          e.WorkflowStateName.toUpperCase() === 'ALL' ||
          e.WorkflowStateName.toUpperCase() === 'NO WORKFLOW'
        ) {
          accessBtn = true;
          return;
        }
      }
    });
  }
}
