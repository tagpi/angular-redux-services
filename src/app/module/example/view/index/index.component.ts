import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReduxService } from '../../../redux';
import { SearchExampleService } from '../../service/search-example.service';

@Component({
  selector: 'index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexComponent implements OnInit, OnDestroy {

  private subs: Subscription[] = [];
  public state;

  constructor(
    public reduxService: ReduxService,
    public searchExampleService: SearchExampleService,
    private changeDetectorRef: ChangeDetectorRef) {

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
        .subscribe(state => {
          this.state = state;
          this.changeDetectorRef.markForCheck();
        })
    );
  }

  unsubscribe() {
    const sub = this.subs.shift();
    sub.unsubscribe();
  }

}
