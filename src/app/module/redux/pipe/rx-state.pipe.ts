import { AsyncPipe } from '@angular/common';
import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ReduxService } from '../service/redux.service';

@Pipe({
  name: 'rxState',
  pure: false
})
export class RxStatePipe implements PipeTransform, OnDestroy {

  async: AsyncPipe;

  constructor(private changeDetectorRef: ChangeDetectorRef, private reduxService: ReduxService) {
    this.async = new AsyncPipe(this.changeDetectorRef);
  }

  transform(value: string): any {
    return this.async.transform(this.reduxService.select(value));
  }

  ngOnDestroy () {
    this.async.ngOnDestroy();
  }

}
