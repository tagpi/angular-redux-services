import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Action, rxAction, rxEpic, ReduxService } from '../../redux';
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

  // @rxAction({ return: true })
  @rxAction({ return: { action: 'queryHandler'} })
  // @rxAction({ return: { path: 'query'} })
  query(criteria: string): any {
    return (state: State, payload: typeof criteria) => {
      state.query = payload;
    };
  }

  @rxEpic('query', 'queryHandler', { cancelable: false })
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

  // action using direct state and action references
  @rxAction({ direct: true }) unsafe(criteria: string) {
    return (state: State, action: Action) => {
      return Object.assign({ ...state, query: action.payload });
    };
  }

  @rxAction() ['@@RESET']() {
    return (state: State) => {
      state.result = [];
    };
  }

}
