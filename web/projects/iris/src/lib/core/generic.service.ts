import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class GenericService extends BaseDataService<any> {
  entity: string;
  constructor(protected injector: Injector) {
    super(injector);
  }

  getControllerName = (): string => 'Generic';

  get(
    id: string | number,
    entity: string = '',
    options: any = {}
  ): Observable<any> {
    const payload = {
      entity: entity ? entity : this.entity,
      action: 'Get',
      id,
      ...options,
    };
    return super.post('Get', payload, false);
  }
  search(criteria: any, entity: string = ''): Observable<any> {
    const payload = {
      entity: entity ? entity : this.entity,
      action: 'search',
      criteria,
    };
    return super.post('Search', payload);
  }

  save(model: any, entity: string = ''): Observable<any> {
    const payload = {
      entity: entity ? entity : this.entity,
      action: 'save',
      model,
    };
    return super.post('Save', payload);
  }
  post(
    controller: string,
    action: string,
    payload: any,
    cache?: boolean = true
  ): Observable<any> {
    return super.postToController(controller, action, payload);
  }

  toggle(model: any, entity: string = ''): Observable<any> {
    const payload = {
      entity: entity ? entity : this.entity,
      action: 'toggle',
      model,
    };
    return super.post('Toggle', payload, false);
  }
  download(model: any, controller: string = ''): Observable<any> {
    return super.postToController(controller, 'Download', model);
  }
  SendEmail(
    controller: string,
    action: string = '',
    payload: any = {},
    cache: boolean = true
  ): Observable<any> {
    payload = { action: action, payload: payload };
    return super.postToController(controller, 'SendEmail', payload);
  }

  // Pagebaseform methods

  public setupSubscriptions(instance: any) {}
  public preSave(instance: any) {}
  public gridPreSave(instance: any, element, event, dataItem) {}
  public postSave(instance: any) {}
  public onPreGridAction(instance: any) {}
  public postGridAction(instance: any) {}
  public populateLocalDomain() {}
  public onButtonPalletClick() {}
  public prePageLoad(instance: any) {}
  public postPageLoad(instance: any) {}
  public onPageLoadingStart(instance: any, fields, model) {}
  public preValidate(instance: any): boolean {
    return false;
  }
  public setGridDetailComponents(instance: any) {}
  public FieldsTransform(instance: any) {}
  public preButtonPalletClick(action: any): boolean {
    return false;
  }
}
