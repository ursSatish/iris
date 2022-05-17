import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogInteractionService {
  input: any;
  response: any;
  dialogUserAction$ = new BehaviorSubject({});
  gridSelectedRows = [];

  constructor() {}
  initialize() {
    this.input = {};
    this.response = {};
  }

  reset() {
    this.initialize();
  }
}
