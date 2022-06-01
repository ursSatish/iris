import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-kendo-checkbox',
  template: `
    <br />
    <input
      type="checkbox"
      class="k-checkbox"
      [class.k-state-invalid]="showError"
      [formControl]="formControl"
      [formlyAttributes]="field"
    />

    <label [for]="id" class="k-checkbox-label">
      <span>
        {{ to.label }}
        <span *ngIf="to.required" class="k-required">*</span>
      </span>
    </label>
  `,
})
export class FormlyFieldCheckbox extends FieldType {
  defaultOptions = {
    templateOptions: {
      hideLabel: true,
    },
  };
}
