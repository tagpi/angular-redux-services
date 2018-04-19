/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReduxService } from './service/redux.service';
import { RxStatePipe } from './pipe/rx-state.pipe';
export class ReduxModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: ReduxModule,
            providers: [ReduxService]
        };
    }
}
ReduxModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                declarations: [RxStatePipe],
                exports: [RxStatePipe],
            },] },
];
function ReduxModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    ReduxModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    ReduxModule.ctorParameters;
}
//# sourceMappingURL=redux.module.js.map