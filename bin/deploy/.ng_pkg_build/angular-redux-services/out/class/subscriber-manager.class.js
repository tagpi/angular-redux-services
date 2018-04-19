/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { BehaviorSubject } from 'rxjs';
import { get, isEqual } from 'lodash';
import { ReduxSubject } from './redux-subject.class';
export class SubscriberManger {
    /**
     * Create a subscriber manager
     * @param {?} getState method that returns the full state;
     */
    constructor(getState) {
        this.getState = getState;
        /**
         * Tracks the active selections. Each subject gets updated
         * when broadcast is called.
         */
        this.selections = {};
    }
    /**
     * Returns a redux observable for the state slice.
     * @template T
     * @param {?} path
     * @return {?}
     */
    select(path) {
        let /** @type {?} */ sliceSub;
        const /** @type {?} */ slice = this.setSlice(path);
        const /** @type {?} */ onActivate = () => {
            slice.links++;
            sliceSub = slice.subscribe((reply) => reduxSubject.next(reply));
        };
        const /** @type {?} */ onDeactivate = () => {
            sliceSub.unsubscribe();
            slice.links--;
            if (!slice.links) {
                this.removeSlice(path);
            }
        };
        const /** @type {?} */ reduxSubject = new ReduxSubject(slice.value, onActivate, onDeactivate);
        return reduxSubject;
    }
    /**
     * Sets the state slice.
     * @template T
     * @param {?} path
     * @return {?}
     */
    setSlice(path) {
        const /** @type {?} */ sub = this.selections[path];
        if (sub) {
            return sub;
        }
        const /** @type {?} */ value = get(this.getState(), path);
        const /** @type {?} */ slice = new BehaviorSubject(value);
        slice.links = 0;
        this.selections[path] = slice;
        return slice;
    }
    /**
     * Clear the slice.
     * @param {?} path
     * @return {?}
     */
    removeSlice(path) {
        delete this.selections[path];
    }
    /**
     * Return the subscriber middleware.
     * @return {?}
     */
    createMiddleware() {
        return store => next => action => {
            const /** @type {?} */ result = next(action);
            this.broadcast(this.getState());
            return result;
        };
    }
    /**
     * Update all tracked observers.
     * @param {?} state
     * @return {?}
     */
    broadcast(state) {
        if (!this.selections) {
            return;
        }
        const /** @type {?} */ keys = Object.keys(this.selections);
        for (let /** @type {?} */ i = keys.length - 1; i > -1; i--) {
            const /** @type {?} */ path = keys[i];
            const /** @type {?} */ subject = this.selections[path];
            const /** @type {?} */ stateValue = get(state, path);
            if (!isEqual(stateValue, subject.getValue())) {
                subject.next(stateValue);
            }
        }
    }
}
function SubscriberManger_tsickle_Closure_declarations() {
    /**
     * Tracks the active selections. Each subject gets updated
     * when broadcast is called.
     * @type {?}
     */
    SubscriberManger.prototype.selections;
    /** @type {?} */
    SubscriberManger.prototype.getState;
}
//# sourceMappingURL=subscriber-manager.class.js.map