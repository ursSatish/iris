import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { GenericService } from '../../core/generic.service';
import { saveAs } from '@progress/kendo-file-saver';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'formly-field-kendo-list',
  template: `
    <ul [formlyAttributes]="field" class="list-group no-bullet-point">
      <li
        *ngFor="let item of model[key]"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <a
          href="javascript:void(0)"
          (click)="OpenFile(item)"
          style="color: blue"
          >{{ item.FileName }}</a
        >
        <span
          *ngIf="item.IsVisibleCloseIcon"
          aria-label="Remove"
          title="Remove"
          class="k-icon k-i-close-circle"
          (click)="RemoveAttachmentList(key, item)"
        ></span>
      </li>
    </ul>
  `,
})
export class FormlyFieldFileListComponent extends FieldType implements OnInit {
  paramValue: any;
  constructor(
    private actionService: GenericService,
    private storeService: StoreService
  ) {
    super();
  }

  ngOnInit(): void {
    this.storeService.removeAttachmentList = [];
  }
  OpenFile(file) {
    const payload = { action: 'post', id: file.ID };
    this.actionService.download(payload).subscribe(
      (blob) => {
        saveAs(blob, file.FileName);
      },
      (error) => {
        ('Something went wrong');
      }
    );
  }

  RemoveAttachmentList(key, item) {
    const index = this.model[key].findIndex((i) => i.ID === item.ID);
    if (index > -1) {
      this.model[key][index].isActive = false;
      this.storeService.removeAttachmentList.push(this.model[key][index]);
      this.model[key].splice(index, 1);
    }
  }
}
