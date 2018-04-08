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
