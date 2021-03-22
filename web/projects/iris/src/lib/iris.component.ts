import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-iris',
  template: `
    <p>
      iris works!
    </p>
  `,
  styles: [
  ]
})
export class IrisComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
