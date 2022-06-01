import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { isNotNilOrEmpty } from '../../core/utility';
import { isNil, split, clone } from 'ramda';
import { Day } from '@progress/kendo-date-math';

@Component({
  selector: 'formly-field-kendo-select',
  template: `
    <kendo-datepicker
      [class.k-state-invalid]="showError"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [min]="to?.minDate"
      [max]="to?.maxDate"
      [disabledDates]="disabledDates"
    ></kendo-datepicker>
  `,
})
export class FormlyFieldDatePicker extends FieldType implements OnInit {
  public disabledDates: Day[] = [];
  ngOnInit() {
    if (this.to.disableDays != null) {
      split(',', this.to.disableDays).forEach((dayName) => {
        const daynameStr = dayName.toLowerCase();
        const dayname =
          daynameStr.charAt(0).toUpperCase() + daynameStr.slice(1);
        this.disabledDates.push(Day[dayname]);
      });
    } else {
      this.disabledDates = null;
    }

    if (this.to.minDate != null) {
      if (this.to.minDate.toUpperCase() === 'NEW DATE()') {
        this.to.minDate = new Date();
      } else {
        const currentDate = new Date();
        this.to.minDate = new Date(
          currentDate.setDate(currentDate.getDate() + parseInt(this.to.minDate))
        );
      }
    } else {
      this.to.minDate = null;
    }
    if (this.to.maxDate != null) {
      if (this.to.maxDate.toUpperCase() === 'NEW DATE()') {
        this.to.maxDate = new Date();
      } else {
        const currentDate = new Date();
        this.to.maxDate = new Date(
          currentDate.setDate(currentDate.getDate() + parseInt(this.to.maxDate))
        );
      }
      if (
        isNotNilOrEmpty(this.to.minDate) &&
        this.to.maxDate.getTime() < this.to.minDate.getTime()
      ) {
        const minDateVal = clone(this.to.minDate);
        this.to.maxDate = new Date(
          minDateVal.setDate(minDateVal.getDate() + 1)
        );
      }
    } else {
      this.to.maxDate = null;
    }
    if (!isNil(this.form.get(this.key))) {
      let value = new Date();
      if (isNotNilOrEmpty(this.form.get(this.key)?.value)) {
        value = new Date(this.form.get(this.key)?.value);
      }
      this.form.get(this.key)?.patchValue(value);
    }
  }
}
