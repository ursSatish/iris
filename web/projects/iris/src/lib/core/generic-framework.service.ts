import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class GenericFrameworkService extends BaseDataService<any> {
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
      isFrameworkCall: true,
      action: 'Get',
      id,
      ...options,
    };
    return super.post('Get', payload);
  }

  search(
    criteria: any,
    entity: string = '',
    cache: boolean = true
  ): Observable<any> {
    const payload = {
      entity: entity ? entity : this.entity,
      isFrameworkCall: true,
      action: 'search',
      criteria,
    };
    return super.post('Search', payload, cache);
  }

  save(model: any, entity: string = ''): Observable<any> {
    const payload = {
      entity: entity ? entity : this.entity,
      isFrameworkCall: true,
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
    payload.isFrameworkCall = true;
    return super.postToController(controller, action, payload);
  }
}
