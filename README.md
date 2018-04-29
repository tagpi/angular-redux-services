# Simplified Redux in Angular

## Setup

* Install the library 
```
npm install --save angular-redux-service
```

* Import ReduxModule in app.module
* Initialize the ReduxService

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

The rxState pipe is an async pipe that will return the state represented by the redux path. Unsubscribing is also handled by the pipe.

```html
<div *ngIf="'@search-example' | rxState as search">
  <span>query: {{ search?.query }}</span>
  <span>result: {{ search?.result }}</span>
</div>
```

## Redux Map Service Configuration

The Redux Map Service is an Angular service that is used to configure the reducer and epics.

```typescript

// state slice interface
export interface State {
  query: string;
  result: any[];
}

@Injectable({ providedIn: 'root' })
export class SearchExampleService {

  // state slice path
  static path = '@search-example';

  // default value
  static initial: State = {
    query: '',
    result: []
  };

  // create the action '@search-example.query'
  // * this will be replaced with a dispatch action upon initialization
  // * the state and payload have been cloned for immutability
  @rxAction() query(criteria: string) {
    return (state: State, payload: typeof criteria) => {
      state.query = payload;
    };
  }

  // create an epic or effect
  // * triggered from 'query'
  // * will call the 'queryHandler' 
  @rxEpic('query', 'queryHandler') private queryRequest(criteria: string) {
    return of([ { name: 'result #1' }]);
  }

  // create the action '@search-example.queryHandler'
  @rxAction() private queryHandler(results: any[]) {
    return (state: State, payload: typeof results) => {
      state.result = payload;
    };
  }

}
```

* Register the service instance to redux

```typescript
@NgModule()
export class SearchExampleModule {
  constructor(reduxService: ReduxService, searchExampleService: SearchExampleService){
    reduxService.register(exampleService);
  }
}
```

# Documentation

## Core
* [Redux Map Service Configuration](https://github.com/tagpi/angular-redux-services/blob/master/doc/service.md)

* [Epic / Effect](https://github.com/tagpi/angular-redux-services/blob/master/doc/epic.md)

* [Action](https://github.com/tagpi/angular-redux-services/blob/master/doc/action.md)


## Added Features
* [Multiple Service Files](https://github.com/tagpi/angular-redux-services/blob/master/doc/multiple-service.md)

* [Reset](https://github.com/tagpi/angular-redux-services/blob/master/doc/reset.md)

* [Resolver](https://github.com/tagpi/angular-redux-services/blob/master/doc/resolver.md)