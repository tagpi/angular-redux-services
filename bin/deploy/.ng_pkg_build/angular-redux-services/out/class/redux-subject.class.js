/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { BehaviorSubject } from 'rxjs';
/**
 * @template T
 */
export class ReduxSubject extends BehaviorSubject {
    /**
     * @param {?} defaultValue
     * @param {?} onActivate
     * @param {?} onDeactivate
     */
    constructor(defaultValue, onActivate, onDeactivate) {
        super(defaultValue);
        this.onActivate = onActivate;
        this.onDeactivate = onDeactivate;
        this.active = 0;
    }
    /**
     * @return {?}
     */
    subscribe() {
        // link to
        if (this.active === 0) {
            this.onActivate();
        }
        // track the number of subscriptions
        this.active++;
        // override unsubscribe
        const /** @type {?} */ subscription = super.subscribe(...Array.prototype.slice.call(arguments));
        const /** @type {?} */ originalUnsub = subscription.unsubscribe.bind(subscription);
        subscription.unsubscribe = () => {
            this.active--;
            // start deactivation when there are no subscriptions
            if (!this.active) {
                this.onDeactivate();
            }
            originalUnsub();
        };
        return subscription;
    }
}
function ReduxSubject_tsickle_Closure_declarations() {
    /** @type {?} */
    ReduxSubject.prototype.active;
    /** @type {?} */
    ReduxSubject.prototype.onActivate;
    /** @type {?} */
    ReduxSubject.prototype.onDeactivate;
}
//# sourceMappingURL=redux-subject.class.js.map