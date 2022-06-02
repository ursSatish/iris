import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { isNilOrEmpty, GetHyperLinkValues } from '../../core/utility';

@Component({
  selector: 'formly-field-kendo-hyperlink',
  template: `
    <a
      [routerLink]="['/' + to.RedirectURL, paramValue]"
      [formlyAttributes]="field"
      style="color:blue"
      >{{ form.get(field.key).value }}
    </a>
  `,
})
export class FormlyFieldHyperLinkComponent extends FieldType implements OnInit {
  paramValue: any;
  retval: any;
  ngOnInit() {
    if (!isNilOrEmpty(this.field.defaultValue)) {
      this.retval = GetHyperLinkValues(this.field.defaultValue);
      this.to.RedirectURL = this.retval[0];
      this.paramValue = this.model[this.retval[1]];
    }
  }
}
