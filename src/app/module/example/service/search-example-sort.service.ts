import { Observable, of } from 'rxjs';
import { Action, rxAction, rxEpic } from '../../redux';
import { State, initial } from '../model/state.model';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchExampleSortService {

  static path = '@search-example';

  @rxAction() sort(criteria: string) {
    return (state: State, payload: typeof criteria) => {
      state.query = payload;
    };
  }

  @rxEpic('sort', 'sortHandler') private sortRequest(criteria: string) {
    return of(['this', 'is', 'from', 'secondary']);
  }

  @rxAction() private sortHandler(results: any[]) {
    return (state: State, payload: typeof results) => {
      state.result = payload;
    };
  }

}
