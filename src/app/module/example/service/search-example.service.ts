import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Action, rxAction, rxEpic } from '../../redux';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { State, initial } from '../model/state.model';


@Injectable({ providedIn: 'root' })
export class SearchExampleService {

  static path = '@search-example';
  static initial = initial;

  constructor(private httpClient: HttpClient) {

  }

  @rxAction() query(criteria: string) {
    return (state: State, payload: typeof criteria) => {
      state.query = payload;
    };
  }

  @rxEpic('query', 'queryHandler') private queryRequest(criteria: string) {
    console.log('queryh', criteria);
    return this.searchEndpoint(criteria);
  }

  @rxAction() private queryHandler(results: any[]) {
    return (state: State, payload: typeof results) => {
      state.result = payload;
    };
  }

  @rxAction(true) clear() {
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

  // action using direct state and action references
  @rxAction(true) unsafe(criteria: string) {
    return (state: State, action: Action) => {
      return Object.assign({ ...state, query: action.payload });
    };
  }

}
