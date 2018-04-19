/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { Injectable } from '@angular/core';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { SubscriberManger } from '../class/subscriber-manager.class';
import { MapManager } from '../class/map-manager.class';
export class ReduxService {
    constructor() {
        this.isInitialized = false;
        /**
         * Reducer list.
         */
        this.reducers = {
            '@redux-service': (state = {}, action) => action.type
        };
        this.subscriber = new SubscriberManger(() => this.getState());
        this.map = new MapManager();
    }
    /**
     * Initializes the redux service
     * @param {?=} preloadedState Initial state
     * @param {?=} middleware
     * @param {?=} isProduction Adds devtools if non production
     * @return {?}
     */
    init(preloadedState = {}, middleware = [], isProduction = false) {
        // middleware
        const /** @type {?} */ composeMiddleware = (!isProduction && window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']) || compose;
        const /** @type {?} */ loadedMiddleware = composeMiddleware(applyMiddleware(...middleware, this.subscriber.createMiddleware()));
        // create store
        this.store = createStore(combineReducers(this.reducers), preloadedState, loadedMiddleware);
        // service has been initialized
        this.isInitialized = true;
        // initialize map with newly created store
        this.map.init(this);
    }
    /**
     * Add a reducer.
     * @param {?} name Root path for the reducer (\@search)
     * @param {?} reducer Reducer method (state, action) => state
     * @return {?}
     */
    add(name, reducer) {
        this.reducers[name] = reducer;
        this.store.replaceReducer(combineReducers(this.reducers));
    }
    /**
     * Registers a redux service instance.
     * @param {?} serviceInstance
     * @return {?}
     */
    register(serviceInstance) {
        this.map.add(this, serviceInstance);
    }
    /**
     * Return the current state.
     * @return {?}
     */
    getState() {
        return this.store.getState();
    }
    /**
     * Dispact an action.
     * @param {?} action
     * @return {?}
     */
    dispatch(action) {
        this.store.dispatch(action);
        this.map.safeDispatch(this, action);
    }
    /**
     * Subscribe to a state slice
     * @template T
     * @param {?} path
     * @return {?}
     */
    select(path) {
        return this.subscriber.select(path);
    }
}
ReduxService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
ReduxService.ctorParameters = () => [];
function ReduxService_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    ReduxService.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    ReduxService.ctorParameters;
    /** @type {?} */
    ReduxService.prototype.isInitialized;
    /**
     * Redux store.
     * @type {?}
     */
    ReduxService.prototype.store;
    /**
     * Reducer list.
     * @type {?}
     */
    ReduxService.prototype.reducers;
    /**
     * Manages state sices into observables.
     * @type {?}
     */
    ReduxService.prototype.subscriber;
    /**
     * Applies redux maps into the redux pattern.
     * @type {?}
     */
    ReduxService.prototype.map;
}
//# sourceMappingURL=redux.service.js.map