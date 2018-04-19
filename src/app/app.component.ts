import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReduxService } from './module/redux/service/redux.service';
import { SearchExampleService } from './module/example/service/search-example.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';
  private subs: Subscription[] = [];
  private state;

  constructor(
    public reduxService: ReduxService,
    public searchExampleService: SearchExampleService) {

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  subscribe() {
    this.subs.push(
      this.reduxService
        .select('@redux-service')
        .subscribe(state => this.state = state)
    );
  }

  unsubscribe() {
    const sub = this.subs.shift();
    sub.unsubscribe();
  }

}
