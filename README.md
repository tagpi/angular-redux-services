# Simplified Redux in Angular

## Setup

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

## rxState Pipe

The rxState pipe is an async pipe that will return the state represented by the redux path.

```html
<div *ngIf="'@search-example' | rxState as search">
  query: {{ search?.query }}
</div>
```

## Redux Map Service Configuration

The Redux Map Service is an Angular service that is used to configure the reducer and epics.

The static path is the root property where the reducer will be set. It is also used to identify the actions (ie. @statePath.actionName).

The static initial is default state of the reducer.

rxAction() creates a reducer function for the action. The rxAction method will be replaced with a dispatch call method once the service is mapped to redux. Calling the method from the service will be same as dispatching the action. The following calls will be the same;

```typescript
searchService.query('abc');

store.dispatch({ 
  type:'@search.query', 
  payload: 'abc'
}));
```

By default, the parameters of reducer function have been cloned to allow direct application of changes to the state. The reducer function does not require to return the state object. Any return value will be ignored.

To use the original behavior for reducers where state has to be replaced within the reducer and a return state is required, set the (@param useOpenReducer) to true.

rxEpic() will be called when (@param query) action has been dispatched. rxEpic will only be called when the action was dispatched through ReduxService. Having the action in other places such as ReduxDevtools will not trigger this.

The epic function should return an Observable<Action> to continue the epic chain.

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/operators';
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

  @rxAction() query(criteria: string) {
    return (state: State, action: Action) => {
      state.query = action.payload;
    };
  }

  @rxEpic('query') callQueryEndPoint(action: Action) {
    return of({
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
export class SearchExampleModule {

  constructor(
    reduxService: ReduxService, 
    searchExampleService: SearchExampleService) {

    reduxService.addMap(exampleService);

  }

}
```