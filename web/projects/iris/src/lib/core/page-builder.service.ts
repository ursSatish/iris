import { Injectable, Injector } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseDataService } from './base-data.service';
import { GenericService } from './generic.service';

@Injectable({ providedIn: 'root' })
export class PageBuilderService extends BaseDataService<any> {
  constructor(
    public injector: Injector,
    private genericService: GenericService
  ) {
    super(injector);
  }
  getControllerName = (): string => 'PageBuilder';
  getSchemaForKey(key: string): Observable<any> {
    return this.genericService.get(key, 'PageBuilder', {
      action: 'GetSchemaForKey',
    });
  }

  getFormGroupForSchems(model: any, data: any): FormGroup {
    const formGroup: FormGroup = new FormGroup({});
    model.fieldGroup.map((e: any) => {
      const disableProp = e.disabled ? true : false;
      formGroup.addControl(
        e.key,
        new FormControl({ value: data[e.key], disabled: disableProp })
      );
    });
    return formGroup;
  }
}
