import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  isLoading = new BehaviorSubject<boolean>(false);

  constructor() {}

  public setLoading(value: boolean) {
    this.isLoading = new BehaviorSubject<boolean>(value);
  }
}
