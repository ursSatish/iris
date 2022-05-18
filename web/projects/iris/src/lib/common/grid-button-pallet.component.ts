import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { split, without, clone } from 'ramda';
import {
  isNilOrEmpty,
  properCase,
  titleCase,
  isNotNilOrEmpty,
} from '../core/utility';
import { StoreService } from '../core/store.service';

export class GridButtonConfig {
  code: string;
  primaryIcon: string;
  secondaryIcon: string;
  text: string;
  action: string;
  actionType: string;
  disabled?: boolean;
  alwaysEnable?: boolean;
}

@Component({
  selector: 'iris-grid-button-pallet',
  template: `
    <ng-container *ngFor="let button of gridButtonConfig">
      <span
        hasPermission
        [entity]="entity"
        [buttonCode]="button?.code"
        [WorkflowState]="WorkflowState"
      >
        <button
          *ngIf="visibleButtons.indexof(button?.code) > -1 && showButton"
          type="button"
          kendoButton
          [icon]="
            button?.code === 'TOGGLE'
              ? isActive
                ? button.primaryIcon
                : button.secondaryIcon
              : button.primaryIcon
          "
          (click)="onClick(button)"
          class="mx-1 my-0"
          [title]="
            button?.code === 'TOGGLE'
              ? isActive
                ? [button.text + 'Active Please click to disable']
                : [button.text + 'InActive Please click to enable']
              : button.text
          "
          [disabled]="button?.disabled"
        >
          <span *ngIf="showLabel"> {{ button.text | titleCase }} </span>
        </button>
      </span>
    </ng-container>
  `,
})
export class GridButtonPalletComponent implements OnInit, OnChanges {
  @Input() buttons: string;
  @Input() isEditRow = false;
  @Input() showLabel = false;
  @Input() isActive = true;
  @Input() showButton = true;
  @Input() isMultiSelect;
  @Input() entity: string;
  @Input() WorkflowState: number;
  @Input() action = new EventEmitter<GridButtonConfig>();

  gridButtonConfig: GridButtonConfig[] = [];
  buttonMaster: Map<string, GridButtonConfig> = new Map();
  visibleButtons: string[] = [];
  disableBtn = false;
  enableUserAddBtn = true;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.loadGridBtns();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isEditRow != null && !changes.isEditRow.currentValue) {
      this.loadGridBtns();
    }
  }
  loadGridBtns() {
    this.buttonMaster = new Map();
    this.gridButtonConfig = [];
    this.visibleButtons = [];
    this.setButtonMaster();
    if (this.isMultiSelect != null && this.isMultiSelect.mode != null) {
      this.disableBtn =
        this.isMultiSelect.mode === 'multiple' ||
        this.isMultiSelect === 'single'
          ? true
          : false;
    }
    this.generateGridButtonConfig();
    if (this.isEditRow) this.visibleButtons = ['SAVE', 'CANCEL'];
  }

  onClick(action: GridButtonConfig) {
    if (isNotNilOrEmpty(this.storeService.detailModel)) {
      this.storeService.updatedDetailModel = clone(
        this.storeService.detailModel
      );
    }
    this.action.emit(action);
  }

  private generateGridButtonConfig() {
    if (isNilOrEmpty(this.buttons)) {
      return;
    }
    split(',', this.buttons).map((button) => {
      if (button === 'SELECT') return;
      this.visibleButtons.push(button.trim());
      this.visibleButtons = without(['SAVE', 'CANCEL'], this.visibleButtons);
      if (isNilOrEmpty(this.buttonMaster.get(button.trim()))) {
        this.gridButtonConfig.push({
          code: button.trim(),
          primaryIcon: null,
          secondaryIcon: null,
          text: titleCase(button.trim().replace('_DIALOG', '')),
          action: '',
          actionType: '',
          disabled: this.disableBtn,
        });
      } else {
        const buttonData = this.buttonMaster.get(button.trim());
        buttonData?.alwaysEnable
          ? (buttonData.disabled = false)
          : (buttonData.disabled = this.disableBtn);
        this.gridButtonConfig.push(buttonData);
      }
    });
  }

  public BtnPalletHandler(gridSelectedRows) {
    gridSelectedRows > 0 ? (this.disableBtn = false) : (this.disableBtn = true);
    this.gridButtonConfig = [];
    this.generateGridButtonConfig();
  }

  private setButtonMaster() {
    this.buttonMaster.set('INLINE_EDIT', {
      code: 'INLINE_EDIT',
      primaryIcon: 'edit',
      secondaryIcon: '',
      text: 'Inline Edit',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('EDIT_DIALOG', {
      code: 'EDIT_DIALOG',
      primaryIcon: 'hyperlink-open',
      secondaryIcon: '',
      text: 'Open Dialog',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('CUSTOM_DIALOG', {
      code: 'CUSTOM_DIALOG',
      primaryIcon: 'hyperlink-open',
      secondaryIcon: '',
      text: 'Open Dialog',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('EDIT_REDIRECT', {
      code: 'EDIT_REDIRECT',
      primaryIcon: 'windows',
      secondaryIcon: '',
      text: 'Edit',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('DELETE', {
      code: 'DELETE',
      primaryIcon: 'delete',
      secondaryIcon: '',
      text: 'Delete',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('SAVE', {
      code: 'SAVE',
      primaryIcon: 'save',
      secondaryIcon: '',
      text: 'Save',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('CANCEL', {
      code: 'CANCEL',
      primaryIcon: 'cancel',
      secondaryIcon: '',
      text: 'Cancel',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('OPEN_TAB', {
      code: 'OPEN_TAB',
      primaryIcon: 'windows-restore',
      secondaryIcon: '',
      text: 'Tab',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('ADD_DIALOG', {
      code: 'ADD_DIALOG',
      primaryIcon: 'windows-restore',
      secondaryIcon: '',
      text: 'Add New',
      action: '',
      actionType: '',
      alwaysEnable: true,
    });

    this.buttonMaster.set('AUTOFIT', {
      code: 'AUTOFIT',
      primaryIcon: 'windows-restore',
      secondaryIcon: '',
      text: 'Auto Fit',
      action: '',
      actionType: '',
      alwaysEnable: true,
    });

    this.buttonMaster.set('TOGGLE', {
      code: 'TOGGLE',
      primaryIcon: 'k-i-check-circle k-i-checkmark-circle',
      secondaryIcon: 'k-i-close-circle k-i-x-circle',
      text: 'Record Status: ',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('EXPORT EXCEL', {
      code: 'EXPORT EXCEL',
      primaryIcon: 'file-excel k-i-file-excel-grid',
      secondaryIcon: '',
      text: 'EXPORT EXCEL',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('EXPORT PDF', {
      code: 'EXPORT PDF',
      primaryIcon: 'file-pdf',
      secondaryIcon: '',
      text: 'EXPORT PDF',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('AUDIT_HISTORY_DIALOG', {
      code: 'AUDIT_HISTORY_DIALOG',
      primaryIcon: 'track-changes',
      secondaryIcon: '',
      text: 'Audit History',
      action: '',
      actionType: '',
    });

    this.buttonMaster.set('ADD', {
      code: 'ADD',
      primaryIcon: 'add',
      secondaryIcon: '',
      text: 'ADD',
      action: '',
      actionType: '',
      alwaysEnable: true,
    });

    this.buttonMaster.set('ADD_REDIRECT', {
      code: 'ADD_REDIRECT',
      primaryIcon: 'windows-restore',
      secondaryIcon: '',
      text: 'AddNew',
      action: '',
      actionType: '',
      alwaysEnable: true,
    });

    this.buttonMaster.set('SYNC_CONTROLS', {
      code: 'SYNC_CONTROLS',
      primaryIcon: 'reload',
      secondaryIcon: '',
      text: 'SYNC CONTROLS',
      action: '',
      actionType: '',
      alwaysEnable: true,
    });
  }
}
