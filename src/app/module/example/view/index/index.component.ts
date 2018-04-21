import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReduxService } from '../../../redux';
import { SearchExampleService } from '../../service/search-example.service';

@Component({
  selector: 'index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, OnDestroy {

  private subs: Subscription[] = [];
  public state;

  constructor(
    public reduxService: ReduxService,
    public searchExampleService: SearchExampleService) {
    reduxService.register(searchExampleService);
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
