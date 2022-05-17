import { Injectable, OnDestroy } from '@angular/core';
import { NotificationService } from '@progress/kendo-angular-notification';
import { Subject } from 'rxjs';
import { SubSink } from 'subsink';
import { isNotNilOrEmpty } from './utility';

@Injectable({ providedIn: 'root' })
export class UserNotificationService implements OnDestroy {
  private subs = new SubSink();
  opened: boolean;
  dialogType: string;
  message = '';
  showComments: boolean;
  result: any;
  result$ = new Subject();

  constructor(private notificationService: NotificationService) {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  dirtyDialog() {}

  save(status: any) {
    this.opened = false;
    this.result = status;
    this.result$.next(true);
  }
  close(status: any) {
    this.opened = false;
    this.result = status;
    this.result$.next(false);
  }

  validationErrors(messages: string[]) {
    if (isNotNilOrEmpty(messages)) {
      const showMessages: any[] = [];
      messages.forEach((item) => showMessages.push(item['Message']));
      this.showNotification('error', showMessages);
    }
  }

  showNotification(dialogType: string, message: string[]) {
    const notificationStyleType: any = { style: dialogType, icon: true };
    this.notificationService.show({
      content: message.join('\n'),
      animation: { type: 'slide', duration: 1000 },
      position: { horizontal: 'center', vertical: 'bottom' },
      type: notificationStyleType,
      hideAfter: 4000,
    });
  }

  deleteConfirmation(message: string): Promise<boolean> {
    this.result = null;
    this.showComments = true;
    this.showDialog('CONFIRMATION', [message]);
    return new Promise((resolve, reject) => {
      this.subs.sink = this.result$.subscribe((ok: boolean) => {
        ok ? resolve(true) : resolve(false);
      });
    });
  }
  showDialog(dialogType: string, messages: string[]) {
    this.opened = true;
    this.dialogType = dialogType;
    this.message = messages.join('\n');
  }

  confirmation(message: string): Promise<boolean> {
    this.result = null;
    this.showComments = false;
    this.showDialog('CONFIRMATION', [message]);
    return new Promise((resolve, reject) => {
      this.subs.sink = this.result$.subscribe((ok: boolean) => {
        ok ? resolve(true) : resolve(false);
      });
    });
  }

  input(message: string) {
    this.showDialog('INPUT', [message]);
  }

  alert(message: string) {
    this.showNotification('info', [message]);
  }

  success(message: string) {
    this.showNotification('success', [message]);
  }
  error(message: string) {
    this.showNotification('error', [message]);
  }
  warning(message: string) {
    this.showNotification('warning', [message]);
  }
}
