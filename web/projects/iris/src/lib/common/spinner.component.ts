import { Component } from '@angular/core';
import { LoadingService } from '../core/loading.service';

@Component({
  selector: 'edge-spinner',
  template: `
    <div *ngIf="loadingService.isLoading.value" class="overlayDIV">
      <div class="center-loader">
        <div class="k-loading-image"></div>
      </div>
    </div>
  `,
})
export class SpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}
