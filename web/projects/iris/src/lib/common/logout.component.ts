import { Component } from '@angular/core';
@Component({
  selector: 'iris-logout',
  template: `
    <div class="alert alert-danger my-1 p-5 fadeInDown animated">
      You are now signedout
    </div>
  `,
})
export class LogoutComponent {
  constructor() {}
}
