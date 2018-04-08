import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchExampleService } from './service/search-example.service';
import { ReduxService } from '../redux';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [ SearchExampleService ]
})
export class ExampleModule {

  constructor(reduxService: ReduxService, searchExampleService: SearchExampleService) {
    reduxService.addMap(searchExampleService);
  }

}
