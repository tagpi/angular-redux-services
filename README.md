# Redux Tools for @angular-redux

## use
- npm install --save angular-redux-service
- import ReduxModule into the main module (app.module)
- run reduxService.init
```typescript
import { ReduxModule, ReduxService } from 'angular-redux-service';
@NgModule({
  imports: [ ReduxModule ]
})
export class AppModule { 
  constructor(reduxService: ReduxService) {
    reduxService.init({}, [], environment.production);
  }
}
```

## state Pipe
- async pipe that will display the redux path
```html
<div *ngIf="'@search-example' | rxState as search">
  query: {{ search?.query }}
</div>
```

## Redux Service Configuration
- single file redux state slice configuration
- @rxAction : creates a method that will dispatch the action inside
- @rxEpic : creates an epic that will only trigger when dispatch is called by ReduxService, it will not trigger on a normal redux dispatch

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Action, rxAction, rxEpic } from '../../redux';

export interface State {
  query: string;
  result: any[];
}

@Injectable()
export class SearchExampleService {

  static path = '@search-example';
  static initial: State = {
    query: '',
    result: []
  };

  @rxAction(true) unsafe(criteria: string) {
    return (state: State, action: Action) => {
      return Object.assign({ ...state, query: action.payload });
    };
  }

  @rxAction() query(criteria: string) {
    return (state: State, action: Action) => {
      state.query = action.payload;
    };
  }

  @rxEpic('query') callQueryEndPoint(action: Action) {
    return Observable.of({
      type: `${SearchExampleService.path}.setResults`,
      payload: [ 1, 2, 3 ]
    });
  }

  @rxAction() setResults() {
    return (state: State, action: Action) => {
      state.result = action.payload;
    };
  }

  @rxAction(true) clear() {
    return (state: State) => {
      return SearchExampleService.initial;
    };
  }

}
```

- provide the redux map service and add it to the redux service
```typescript
@NgModule({
  providers: [ SearchExampleService ]
})
export class ExampleModule {
  constructor(reduxService: ReduxService, searchExampleService: SearchExampleService) {
    reduxService.addMap(exampleService);
  }
}
```