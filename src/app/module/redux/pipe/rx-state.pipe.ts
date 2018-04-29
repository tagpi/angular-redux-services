import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ReduxService } from '../service/redux.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'rxState',
  pure: false
})
export class RxStatePipe implements PipeTransform, OnDestroy {

  sub: Subscription;
  value: any;

  constructor(private changeDetectorRef: ChangeDetectorRef, private reduxService: ReduxService) {
  }

  transform(value: string): any {
    this.ngOnDestroy();
    this.sub = this.reduxService
      .select(value)
      .subscribe(innerValue => {
        this.changeDetectorRef.markForCheck();
        this.value = innerValue;
      });
    return this.value;
  }

  ngOnDestroy () {
    if (this.sub) { this.sub.unsubscribe(); }
  }

}
