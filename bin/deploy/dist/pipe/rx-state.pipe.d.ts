import { AsyncPipe } from '@angular/common';
import { PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ReduxService } from '../service/redux.service';
import { Subscription } from 'rxjs';
export declare class RxStatePipe implements PipeTransform, OnDestroy {
    private changeDetectorRef;
    private reduxService;
    async: AsyncPipe;
    sub: Subscription;
    constructor(changeDetectorRef: ChangeDetectorRef, reduxService: ReduxService);
    transform(value: string): any;
    ngOnDestroy(): void;
}
