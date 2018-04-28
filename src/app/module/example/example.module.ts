import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchExampleService } from './service/search-example.service';
import { ReduxService, ReduxModule } from '../redux';
import { routing } from './example.routing';
import { IndexComponent } from './view/index/index.component';
import { SearchExampleSortService } from './service/search-example-sort.service';
import { RouterTestComponent } from './view/router-test/router-test.component';
import { SearchConstructService } from './service/search-construct.service';

@NgModule({
  imports: [
    routing,
    CommonModule,
    ReduxModule,
  ],
  declarations: [
    IndexComponent,
    RouterTestComponent
  ],
})
export class ExampleModule {

  constructor(
    reduxService: ReduxService,
    searchExampleService: SearchExampleService,
    searchExampleSortService: SearchExampleSortService,
    searchConstructService: SearchConstructService) {

    reduxService.register(
      searchExampleService,
      searchExampleSortService,
      searchConstructService
    );

  }

}
