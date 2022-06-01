import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-kendo-textarea',
  template: `
    <textarea
      class="k-textarea col-12"
      rows="4"
      [class.k-state-invalid]="showError"
      [formControl]="formControl"
      [formlyAttributes]="field"
    ></textarea>
  `,
})
export class FormlyFieldTextArea extends FieldType {}
