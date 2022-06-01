import { Component, Injector, OnDestroy } from '@angular/core';
import { GenericService } from '../../core/generic.service';
import { PageBaseFormComponent } from '../../base/page-base-form';

@Component({
  selector: 'iris-generic-popup',
  template: `
    <form [formGroup]="form" class="k-form flex">
      <formly-form
        [model]="model"
        [fields]="fields"
        [options]="options"
        [form]="form"
      ></formly-form>
    </form>
  `,
})
export class GenericPopupComponent
  extends PageBaseFormComponent
  implements OnDestroy
{
  constructor(
    protected injector: Injector,
    protected genericService: GenericService
  ) {
    super(injector, genericService);
  }

  ngOnDestroy(): void {
    this.logger.log('Popup Component Destroyed');
  }
}
