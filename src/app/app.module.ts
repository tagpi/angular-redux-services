import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ReduxModule } from './module/redux/redux.module';
import { ReduxService } from './module/redux/service/redux.service';
import { ExampleModule } from './module/example/example.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReduxModule,
    ExampleModule
  ],
  providers: [ ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor(reduxService: ReduxService) {

    reduxService.init( {}, [], false /* environment.production */ );

    setTimeout(() => {
      reduxService.addReducer('@search', (state, action) => {
        switch (action.type) {
          case 'search':
            return { result: [1, 2, 3] };
          default:
            return { };
        }
      });
    }, 2000);

  }
}
