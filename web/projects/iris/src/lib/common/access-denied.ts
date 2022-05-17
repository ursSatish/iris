import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="alert alert-danger my-1 p-5 fadeInDown animated">
      <h3>Access Denied</h3>
      <h5>You do not have permissions to access the page.</h5>
    </div>
  `,
})
export class AccssDeniedComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
