import { Injectable, Injector } from '@angular/core';
import { SessionService } from './session.service';
import { StoreService } from './store.service';
import { isNilOrEmpty, isNotNilOrEmpty } from './utility';

@Injectable({ providedIn: 'root' })
export class MessageService {
  constructor(
    protected injector: Injector,
    protected storeService: StoreService,
    protected sessionService: SessionService
  ) {
    this.sessionService = this.injector.get(SessionService);
    this.storeService = this.injector.get(StoreService);
  }

  public getNotificatinMessage(
    type: string,
    action: string,
    entity: string
  ): string {
    let roleName = this.sessionService.context.userInfo.activeRole;
    let notificationMessage: string;
    let jsonString =
      this.storeService.config[
        entity.toUpperCase() + '_' + roleName.toUpperCase()
      ];
    if (!isNilOrEmpty(jsonString)) {
      let jsonObject = JSON.parse(jsonString);
      jsonObject = jsonObject.ActionTypes.find(
        (x: any) => x.ActionType == action
      );
      if (isNotNilOrEmpty(jsonObject)) {
        if (type === 'Success') {
          notificationMessage = jsonObject.MessageType[0].Success;
        } else {
          notificationMessage = jsonObject.MessageType[0].Failure;
        }
      } else {
        notificationMessage = 'Information saved successfully';
      }
    } else {
      if (type === 'Success' && isNilOrEmpty(notificationMessage)) {
        notificationMessage = 'Information saved successfully';
      } else {
        notificationMessage =
          'Please fill in the required & resolve the validation errors';
      }
    }
  }
}
