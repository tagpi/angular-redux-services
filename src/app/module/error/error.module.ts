import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './view/error/error.component';
import { routing } from './error.routing';

@NgModule({
  imports: [
    routing,
    CommonModule
  ],
  declarations: [ErrorComponent]
})
export class ErrorModule { }
