import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchExampleService } from './service/search-example.service';
import { ReduxService, ReduxModule } from '../redux';
import { routing } from './example.routing';
import { IndexComponent } from './view/index/index.component';
import { SearchExampleSortService } from './service/search-example-sort.service';

@NgModule({
  imports: [
    routing,
    CommonModule,
    ReduxModule,
  ],
  declarations: [
    IndexComponent
  ],
})
export class ExampleModule {

  constructor(
    reduxService: ReduxService,
    searchExampleService: SearchExampleService,
    searchExampleSortService: SearchExampleSortService) {

    reduxService.register(searchExampleService);
    reduxService.register(searchExampleSortService);

  }

}
