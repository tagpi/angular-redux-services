/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { get, cloneDeep } from 'lodash';
import { take } from 'rxjs/operators';
export class MapManager {
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
function MapManager_tsickle_Closure_declarations() {
    /**
     * Tracks the loaded services
     * @type {?}
     */
    MapManager.prototype.loaded;
    /**
     * Safe epic list. Only gets triggered when dispatched through this service.
     * For global triggered epics, Use redux-observable via epics param in the
     * init function.
     * @type {?}
     */
    MapManager.prototype.epic;
    /**
     * Tracks added services prior to store initialization.
     * @type {?}
     */
    MapManager.prototype.initQueue;
}
//# sourceMappingURL=map-manager.class.js.map