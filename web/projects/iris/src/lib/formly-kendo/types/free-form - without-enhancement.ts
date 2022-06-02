import { Component, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { SubSink } from 'subsink';
import { isNotNilOrEmpty, isNilOrEmpty, reviver } from '../../core/utility';
import { PageBuilderService } from '../../core/page-builder.service';
import { forkJoin } from 'rxjs';
import { GenericService } from '../../core/generic.service';
import { sanitizePageMetaData } from '../../base/page-util';
import { StoreService } from '../../core/store.service';

@Component({
  selector: 'formly-field-kendo-freeform',
  template: `
    <kendo-splitter>
      <kendo-splitter-pane>
        <h5 class="m-2">{{ to.label }}</h5>
        <formly-form
          [model]="modelData"
          [fields]="fields"
          [options]="options"
          [form]="form"
        ></formly-form>
      </kendo-splitter-pane>
    </kendo-splitter>
    <br />
  `,
})
export class FormlyFieldFreeFormComponent extends FieldType implements OnInit {
  private subs = new SubSink();
  fields: FormlyFieldConfig[];
  modelData: any = {};
  selectedValue: any;
  updatedModel = [];
  constructor(
    protected pageBuilderService: PageBuilderService,
    protected actionService: GenericService,
    protected storeService: StoreService
  ) {
    super();
  }
  ngOnInit(): void {
    this.fields = [];
    this.selectedValue = {};

    if (isNotNilOrEmpty(this.to['parentFieldName'])) {
      if (isNotNilOrEmpty(this.storeService.currentsectionId)) {
        this.subs.sink = forkJoin([
          this.pageBuilderService.get('SectionDetail'),
          this.actionService.get(
            this.storeService.currentsectionId.id,
            'Section'
          ),
        ]).subscribe(([fields, model]) => {
          this.storeService.setLocaldomain(fields[0].LocalDomain);
          this.fields = [fields[3]];
          this.modelData = JSON.parse(JSON.stringify(model), reviver);
          this.storeService.currentsectionId = {};
        });
        this.storeService.currentsectionId = {};
      }
      this.subs.sink = this.form
        .get(this.to['parentFieldName'])
        ?.valueChanges.subscribe((d) => {
          if (Object.keys(this.modelData).length !== 0) {
            if (this.field.key === 'SectionView') {
              const Storeindex = this.storeService.modelobjectDatat.findIndex(
                (e) => e.Section.ID === this.selectedValue.id
              );
              if (Storeindex === -1) {
                this.storeService.modelobjectDatat.push(this.modelData);
              } else {
                this.storeService.modelobjectDatat[Storeindex] = this.modelData;
              }
              this.storeService.currentsectionId = this.selectedValue;
              this.storeService.currentSectionId2 = isNotNilOrEmpty(
                this.selectedValue.baseSectionID
              )
                ? this.selectedValue.baseSectionID
                : this.selectedValue.id;
            }
          }
          if (d !== this.selectedValue) {
            this.selectedValue = d;
            this.subs.sink = forkJoin([
              this.pageBuilderService.get('SectionDetail'),
              this.actionService.get(d.id, 'Section'),
            ]).subscribe(([fields, model]) => {
              this.storeService.setLocaldomain(fields[0].LocalDomain);
              if (this.field.key === 'SectionView') {
                this.fields = [fields[2]];
              } else {
                this.fields = [fields[3]];
              }
              const modelindex = this.storeService.modelobjectDatat.findIndex(
                (e) => e.Section.ID === this.selectedValue.id
              );
              if (modelindex === -1) {
                this.modelData = JSON.parse(JSON.stringify(model), reviver);
              } else {
                this.modelData = JSON.parse(
                  JSON.stringify(
                    this.storeService.modelobjectDatat[modelindex]
                  ),
                  reviver
                );
              }
            });
          }
        });
    }
  }
}
