import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
    return (state: State, payload: typeof criteria) => {
      state.query = payload;
    };
  }

  @rxEpic('query') callQueryEndPoint(action: Action) {
    return of({
      type: `${SearchExampleService.path}.setResults`,
      payload: [ 1, 2, 3 ]
    });
  }

  @rxAction() setResults(results: any[]) {
    return (state: State, payload: typeof results) => {
      state.result = payload;
    };
  }

  @rxAction(true) clear() {
    return (state: State) => {
      return SearchExampleService.initial;
    };
  }

}
