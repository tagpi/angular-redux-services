import { AsyncPipe } from '@angular/common';
import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ReduxService } from '../service/redux.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'rxState',
  pure: false
})
export class RxStatePipe implements PipeTransform, OnDestroy {

  async: AsyncPipe;
  sub: Subscription;

  constructor(private changeDetectorRef: ChangeDetectorRef, private reduxService: ReduxService) {
    this.async = new AsyncPipe(this.changeDetectorRef);
  }

  transform(value: string): any {
    const select = this.reduxService.select(value);
    this.sub = select.subscribe(() => this.changeDetectorRef.markForCheck());
    return this.async.transform(select);
  }

  ngOnDestroy () {
    this.async.ngOnDestroy();
    if (this.sub) { this.sub.unsubscribe(); }
  }

}
