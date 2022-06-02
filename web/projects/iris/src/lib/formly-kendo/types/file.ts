import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import {
  FileRestrictions,
  RemoveEvent,
  SelectEvent,
} from '@progress/kendo-angular-upload';
import { StoreService } from '../../core/store.service';
import { never } from 'rxjs';

@Component({
  selector: 'formly-field-kendo-fileupload',
  template: `
    <kendo-upload
      [saveUrl]="uploadSaveUrl"
      [removeUrl]="uploadRemoveUrl"
      [restrictions]="fileRestrictions"
      (remove)="removeEventHandler($event)"
      (select)="selectEventHandler($event)"
      (clear)="clearEventHandler()"
      (complete)="completeEventHandler()"
    >
    </kendo-upload>
  `,
})
export class FormlyFieldFileUploadComponent
  extends FieldType
  implements OnInit
{
  uploadSaveUrl = 'saveUrl';
  uploadRemoveUrl = 'removeUrl';

  public fileRestrictions: FileRestrictions = {
    allowedExtensions: ['doc', 'docx', 'pdf', 'xls', 'xlsx'],
    maxFileSize: 4000000,
    minFileSize: 2048,
  };

  constructor(public storeService: StoreService) {
    super();
  }

  ngOnInit(): void {
    this.storeService.fileUploadList = [];
  }

  public completeEventHandler() {
    this.form.get(this.key)?.setValue(this.storeService.fileUploadList);
  }

  public removeEventHandler(e: RemoveEvent) {
    const index = this.storeService.fileUploadList.findIndex(
      (item) => item.name === e.files[0].name
    );

    if (index >= 0) {
      this.storeService.fileUploadList.splice(index, 1);
    }
  }

  public clearEventHandler() {
    this.storeService.fileUploadList = [];
  }

  public selectEventHandler(e: SelectEvent): void {
    const that = this;

    e.files.forEach((file) => {
      if (!file.validationErrors) {
        that.storeService.fileUploadList.unshift(file.rawFile);
      }
    });
  }
}
