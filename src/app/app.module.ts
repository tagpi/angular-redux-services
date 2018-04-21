import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ReduxModule } from './module/redux/redux.module';
import { ReduxService } from './module/redux/service/redux.service';
import { routing } from './app.routing';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    routing,
    BrowserModule,
    ReduxModule,
    HttpClientModule,
  ],
  providers: [ ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor(reduxService: ReduxService) {

    reduxService.init( {}, [], false /* environment.production */ );

    setTimeout(() => {
      reduxService.add('@search', (state, action) => {
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
