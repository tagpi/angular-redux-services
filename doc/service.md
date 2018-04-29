# Redux Map Service Configuration

The Redux Map Service is an Angular service that is used to configure the reducer and epics.

The static path property is the root property where the reducer will be set. It is also used to identify the actions (ie. @statePath.actionName).

The static initial property will be the default state of the reducer.

rxAction() creates a reducer function for the action. The rxAction method will be replaced with a dispatch call method once the service is mapped to redux. Calling the method from the service will be the same as dispatching the action. The following calls will be the same:

```typescript
searchService.query('abc');

store.dispatch({ 
  type:'@search.query', 
  payload: 'abc'
}));
```

By default, the parameters of reducer function have been cloned to allow direct application of changes to the state. The reducer function does not require to return the state object. Any return value will be ignored.

To use the original behaviour for reducers where state has to be replaced within the reducer and a return state is required, set the (@param useOpenAction) to true.

rxEpic(action, relayTo) will be called when the action parameter has been dispatched. rxEpic will only be called when the action was dispatched through ReduxService. Having the action in other places such as Redux Devtools will not trigger this. 

Once the observable completes, an action of type (@param relayTo) will be dispatched with the observable result as the payload. If (@param relayTo) is not provided, the observable returned should be an Action.

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Action, rxAction, rxEpic, ReduxService } from 'angular-redux-services';
import { catchError, delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { State, initial } from '../model/state.model';


@Injectable({ providedIn: 'root' })
export class SearchExampleService {

  static path = '@search-example';
  static initial = initial;

  constructor(
    private httpClient: HttpClient,
    private reduxService: ReduxService) {

  }

  select() {
    return this.reduxService.select<State>(SearchExampleService.path);
  }

  @rxAction() query(criteria: string) {
    return (state: State, payload: typeof criteria) => {
      state.query = payload;
    };
  }

  @rxEpic('query', 'queryHandler', { cancelable: false}) 
  private queryRequest(criteria: string) {
    return this
      .searchEndpoint(criteria)
      .pipe(delay(2000));
  }

  @rxAction() private queryHandler(results: any[]) {
    return (state: State, payload: typeof results) => {
      state.result = payload;
    };
  }

  @rxAction({ direct: true }) clear() {
    return (state: State) => {
      return SearchExampleService.initial;
    };
  }

  // regular service
  private searchEndpoint(criteria: string) {
    return this.httpClient
      .post('url', { criteria })
      .pipe(catchError(result => of(['why', 'i', 'break', '?'])));
  }

}
```

The service has to be registered to get initialized.

```typescript
@NgModule({})
export class SearchExampleModule {
  constructor(
    reduxService: ReduxService, 
    searchExampleService: SearchExampleService) {

    reduxService.register(exampleService);

  }
}
```