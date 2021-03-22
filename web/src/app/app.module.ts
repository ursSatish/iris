import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IrisModule } from 'iris';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, IrisModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
