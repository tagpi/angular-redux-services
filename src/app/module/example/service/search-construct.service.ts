import { Injectable } from '@angular/core';
import { ReduxService, rxAction } from '../../redux';
import { initChangeDetectorIfExisting } from '@angular/core/src/render3/instructions';

export interface State {
  [name: string]: any;
}

@Injectable({ providedIn: 'root' })
export class SearchConstructService {

  static path = '@search-construct';
  static initial = {};
  static preserve = true;

  constructor(private reduxService: ReduxService) {
    this.select().subscribe(state => console.log('construct', state));
    setTimeout(() => this.init(), 2000);
  }

  public select() {
    return this.reduxService.select(SearchConstructService.path);
  }

  @rxAction() init() {
    return (state: State) => {
      state.dat = 'ok';
    };
  }

}
