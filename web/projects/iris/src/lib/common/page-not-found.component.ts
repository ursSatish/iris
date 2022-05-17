import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '../logger/logger.service';

@Component({
  selector: 'iris-page-not-found',
  template: `
    <div class="card m-3">
      <h6 class="card-header">Page Not Found</h6>
      <div class="card-body">
        <p>Page you are looking for is not available</p>
      </div>
    </div>
  `,
})
export class PageNotFoundComponent implements OnInit {
  constructor(
    private logger: LoggerService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.logger.log(
      `User tried to access the following route ${this.activatedRoute.snapshot.toString()} that is not available!`
    );
  }
}
