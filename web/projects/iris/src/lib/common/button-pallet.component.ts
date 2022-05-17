import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { split, toUpper } from 'ramda';
import { SessionService } from '../core/session.service';
import { StoreService } from '../core/store.service';
import { isNotNilOrEmpty } from '../core/utility';
import { LoggerService } from '../logger/logger.service';

export class ButtonConfig {
  constructor(public code: string, public label: string) {}
}

@Component({
  selector: 'iris-button-pallet',
  template: `
    <ng-container
      class="button-pallet-border"
      *ngFor="let button of buttonConfig"
    >
      <button
        hasPermission
        [entity]="currentEntity"
        [buttonCode]="button?.code"
        type="button"
        kendoButton
        (click)="onClick(button, $event)"
        class="mx-1"
      >
        {{ button.label | titlecase }}
      </button>
    </ng-container>
  `,
})
export class ButtonPalletComponent implements OnInit {
  @Input() buttons: string;
  buttonConfig: ButtonConfig[];
  @Output() action = new EventEmitter<ButtonConfig>();
  currentEntity: string;
  constructor(
    private logger: LoggerService,
    private sessionService: SessionService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.currentEntity = this.storeService.currentEntity;
    if (isNotNilOrEmpty(this.buttons)) {
      this.buttonConfig = split(',', this.buttons)
        .filter((e) => e.trim().length > 0)
        .map((e) => new ButtonConfig(toUpper(e), e));
    }
  }

  onClick(action: ButtonConfig, event: Event) {
    event.preventDefault();
    this.action.emit(action);
  }
}
