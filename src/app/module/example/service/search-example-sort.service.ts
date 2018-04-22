import { Observable, of, empty } from 'rxjs';
import { Action, rxAction, rxEpic } from '../../redux';
import { State, initial } from '../model/state.model';
import { Injectable } from '@angular/core';
import { delay, merge } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SearchExampleSortService {

  static path = '@search-example';

  @rxAction() sort(criteria: string) {
    return (state: State, payload: typeof criteria) => {
      state.query = payload;
    };
  }

  @rxEpic('sort', 'sortHandler') private sortRequest(criteria: string) {
    return empty().pipe(
      merge(
        of(['this', 'is', 'from', 'secondary']),
        of(['third', 'call', 'out'])
      ),
      delay(3000)
    );
  }

  @rxAction() private sortHandler(results: any[]) {
    return (state: State, payload: typeof results) => {
      state.result = payload;
    };
  }

}
