import { BehaviorSubject } from 'rxjs';
import { get, isEqual, cloneDeep } from 'lodash';
import { take } from 'rxjs/operators';
import { Injectable, NgModule, Pipe, ChangeDetectorRef, defineInjectable } from '@angular/core';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { AsyncPipe, CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @template T
 */
class ReduxSubject extends BehaviorSubject {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class SubscriberManger {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class MapManager {
    constructor() {
        /**
         * Tracks the loaded services
         */
        this.loaded = {};
        /**
         * Safe epic list. Only gets triggered when dispatched through this service.
         * For global triggered epics, Use redux-observable via epics param in the
         * init function.
         */
        this.epic = {};
        /**
         * Tracks added services prior to store initialization.
         */
        this.initQueue = [];
    }
    /**
     * Process queued services
     * @param {?} reduxService
     * @return {?}
     */
    init(reduxService) {
        while (this.initQueue.length) {
            const /** @type {?} */ serviceInstance = this.initQueue.shift();
            this.add(reduxService, serviceInstance);
        }
    }
    /**
     * Add a redux map service class instance.
     * @param {?} reduxService Redux service that will consume it
     * @param {?} serviceInstance Service instance of the class
     * @return {?}
     */
    add(reduxService, serviceInstance) {
        const /** @type {?} */ serviceName = serviceInstance.constructor.name;
        // check if redux service is initialized
        if (!reduxService.isInitialized) {
            this.initQueue.push(serviceInstance);
            return;
        }
        // identify path
        const /** @type {?} */ path = serviceInstance.constructor.path;
        if (!path) {
            console.error('Redux map static path not found for', serviceName);
            return;
        }
        // identify properties
        this.identify(reduxService, serviceInstance);
    }
    /**
     * Convert the map to the redux flow
     * @param {?} reduxService
     * @param {?} serviceInstance
     * @return {?}
     */
    identify(reduxService, serviceInstance) {
        const /** @type {?} */ path = serviceInstance.constructor.path;
        const /** @type {?} */ reducer = (this.loaded[path] = this.loaded[path] || {});
        // identify parts
        const /** @type {?} */ keys = Object.getOwnPropertyNames(serviceInstance.constructor.prototype);
        if (keys && keys.length) {
            keys.forEach(propertyName => {
                const /** @type {?} */ rx = get(serviceInstance.constructor.prototype[propertyName], `prototype.constructor.__rx__`);
                if (rx) {
                    if (rx.epic) {
                        this.addEpic(reduxService, serviceInstance, propertyName, rx.epic);
                    }
                    if (rx.action) {
                        this.addAction(reduxService, serviceInstance, propertyName, rx.action, reducer);
                    }
                }
            });
        }
        // finalize reducer
        if (Object.keys(reducer).length) {
            this.addReducer(reduxService, serviceInstance, reducer);
        }
    }
    /**
     * Add an epic.
     * @param {?} reduxService
     * @param {?} serviceInstance
     * @param {?} propertyName
     * @param {?} epic
     * @return {?}
     */
    addEpic(reduxService, serviceInstance, propertyName, epic) {
        const /** @type {?} */ actionName = `${serviceInstance.constructor.path}.${epic.action}`;
        const /** @type {?} */ list = this.epic[actionName] = this.epic[actionName] || [];
        list.push((action) => serviceInstance[propertyName](action));
    }
    /**
     * @param {?} reduxService
     * @param {?} serviceInstance
     * @param {?} propertyName
     * @param {?} action
     * @param {?} reducer
     * @return {?}
     */
    addAction(reduxService, serviceInstance, propertyName, action, reducer) {
        const /** @type {?} */ actionName = `${serviceInstance.constructor.path}.${propertyName}`;
        const /** @type {?} */ fn = serviceInstance[propertyName]();
        if (!fn) {
            return;
        }
        fn.useOpenAction = !!action.useOpenAction;
        reducer[actionName] = fn;
        serviceInstance[propertyName] = (payload) => {
            reduxService.dispatch({ type: actionName, payload });
        };
    }
    /**
     * Add a reducer.
     * @param {?} reduxService
     * @param {?} serviceInstance
     * @param {?} reducer
     * @return {?}
     */
    addReducer(reduxService, serviceInstance, reducer) {
        const /** @type {?} */ path = serviceInstance.constructor.path;
        const /** @type {?} */ initial = serviceInstance.constructor.initial || {};
        const /** @type {?} */ reducerMethod = (state = initial, action) => {
            const /** @type {?} */ op = reducer[action.type];
            if (!op) {
                return state;
            }
            if (op.useOpenAction) {
                return op(state, action);
            }
            const /** @type {?} */ newState = cloneDeep(state);
            const /** @type {?} */ payload = cloneDeep(action.payload);
            op(newState, payload);
            return newState;
        };
        reduxService.add(path, reducerMethod);
    }
    /**
     * Trigger the safe epics.
     * @param {?} reduxService
     * @param {?} action
     * @return {?}
     */
    safeDispatch(reduxService, action) {
        if (!action || !action.type) {
            console.warn('Redux safe dispatch called without action');
            return;
        }
        const /** @type {?} */ epics = this.epic[action.type];
        if (epics) {
            epics.forEach(epic => epic(action.payload)
                .pipe(take(1))
                .subscribe(reply => reduxService.dispatch(reply)));
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class ReduxService {
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
    { type: Injectable, args: [{ providedIn: 'root' },] },
];
/** @nocollapse */
ReduxService.ctorParameters = () => [];
/** @nocollapse */ ReduxService.ngInjectableDef = defineInjectable({ factory: function ReduxService_Factory() { return new ReduxService(); }, token: ReduxService, providedIn: "root" });

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class RxStatePipe {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class ReduxModule {
}
ReduxModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                declarations: [RxStatePipe],
                exports: [RxStatePipe],
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Configure a action for the state slice. The state and payload
 * parameters has been deep cloned. This output will be the parameter
 * state. It will not read the return output.
 * \@Action(useOpenReducer) fnName(payload: T) {
 *   return (state: State, action: Action) => {
 *     state.param1 = action.payload.param1;
 *     state.param2 = action.payload.param2;
 *   };
 * }
 * @param {?=} useOpenAction Truthy to use traditional redux pattern and full dispatched action.
 * @param {?=} useCompleteAction
 * @return {?}
 */
function rxAction(useOpenAction = false, useCompleteAction = false) {
    return function (target, propertyKey, descriptor) {
        target[propertyKey]['__rx__'] = target['__rx__'] || {};
        target[propertyKey]['__rx__'].action = {
            name: `${propertyKey}`,
            useOpenAction
        };
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Configure an epic.
 * \@epic(action) fnName(payload) {
 *  return Observable.of({
 *    type: `${SearchExampleService.path}.setResults`,
 *    payload: [ 1, 2, 3 ]
 * });
 * }
 * @param {?} action The action name to create the epic on.
 * @return {?}
 */
function rxEpic(action) {
    return function (target, propertyKey, descriptor) {
        target[propertyKey]['__rx__'] = target['__rx__'] || {};
        target[propertyKey]['__rx__'].epic = {
            action: `${action}`,
        };
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { ReduxModule, ReduxService, rxAction, rxEpic, RxStatePipe };
//# sourceMappingURL=angular-redux-services.js.map
