/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { AsyncPipe } from '@angular/common';
import { Pipe, ChangeDetectorRef } from '@angular/core';
import { ReduxService } from '../service/redux.service';
export class RxStatePipe {
    /**
     * @param {?} changeDetectorRef
     * @param {?} reduxService
     */
    constructor(changeDetectorRef, reduxService) {
        this.changeDetectorRef = changeDetectorRef;
        this.reduxService = reduxService;
        this.async = new AsyncPipe(this.changeDetectorRef);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    transform(value) {
        return this.async.transform(this.reduxService.select(value));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.async.ngOnDestroy();
    }
}
RxStatePipe.decorators = [
    { type: Pipe, args: [{
                name: 'rxState',
                pure: false
            },] },
];
/** @nocollapse */
RxStatePipe.ctorParameters = () => [
    { type: ChangeDetectorRef, },
    { type: ReduxService, },
];
function RxStatePipe_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    RxStatePipe.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    RxStatePipe.ctorParameters;
    /** @type {?} */
    RxStatePipe.prototype.async;
    /** @type {?} */
    RxStatePipe.prototype.changeDetectorRef;
    /** @type {?} */
    RxStatePipe.prototype.reduxService;
}
//# sourceMappingURL=rx-state.pipe.js.map