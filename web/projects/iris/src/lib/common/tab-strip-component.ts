import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { StoreService } from '../core/store.service';

@Component({
  selector: 'app-tab-strip',
  template: `
    <kendo-tabstrip (tabselect)="onTabSelect($event)" [ngClass]="panelWidth">
      <kendo-tabstrip-tab
        *ngFor="let tab of steps; let index = index; let last = last"
        [title]="tab.label"
        [selected]="activeTabIndex === index"
      >
        <ng-template kendoTabContent>
          <ng-container
            *ngFor="let rowField of tab.fields; let rowIndex = index"
          >
            <formly-form
              [model]="model"
              [fields]="[rowField]"
              [options]="options"
              [form]="form.at(index)"
            ></formly-form>
            <ng-container #container></ng-container>
            <app-tab-strip
              *ngIf="rowField['child'] && rowField['child'].length > 0"
              [steps]="rowField['child']"
              [model]="model"
              [panelWidth]="'panelWidth'"
              [options]="options"
              [form]="form"
            ></app-tab-strip>
          </ng-container>
        </ng-template>
      </kendo-tabstrip-tab>
    </kendo-tabstrip>
  `,
})
export class TabStripComponent implements OnInit {
  @Input() steps: any;
  @Input() model: any;
  @Input() options: any;
  @Input() form: any;
  @Input() activeTabIndex = 0;
  @Input() panelWidth: any;
  @Input() disableTabs: any;
  tabEvent: any;
  @Output() tabInfo = new EventEmitter<string>();
  constructor(private storeService: StoreService) {}
  ngOnInit(): void {
    this.activeTabIndex = this.storeService.activeTabIndex;
  }
  onTabSelect(event: any) {
    this.storeService.activeTabIndex = event.index;
    this.activeTabIndex = this.storeService.activeTabIndex;
    this.tabInfo.emit(event);
  }
}
