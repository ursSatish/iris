import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'formly-array-type',
  template: `
    <div *ngFor="let field of field.fieldGroup; let i = index" class="row m-2">
      <formly-field class="col-sm-8" [field]="field"></formly-field>
      <button class="btn btn-danger btn-sm" type="button" (click)="remove(i)">
        Remove
      </button>
    </div>
    <div class="d-flex flex-row">
      <button class="btn btn-primary btn-sm" type="button" (click)="add()">
        Add
      </button>
    </div>
  `,
})
export class FormlyFieldArray extends FieldArrayType {}
