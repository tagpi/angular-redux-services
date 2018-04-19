import { AsyncPipe } from '@angular/common';
import { PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ReduxService } from '../service/redux.service';
export declare class RxStatePipe implements PipeTransform, OnDestroy {
    private changeDetectorRef;
    private reduxService;
    async: AsyncPipe;
    constructor(changeDetectorRef: ChangeDetectorRef, reduxService: ReduxService);
    transform(value: string): any;
    ngOnDestroy(): void;
}
