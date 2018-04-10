import { __spread } from 'tslib';
import { BehaviorSubject } from 'rxjs';
import { get, isEqual, cloneDeep } from 'lodash';
import { take } from 'rxjs/operators';
import { Injectable, Pipe, ChangeDetectorRef, NgModule } from '@angular/core';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { AsyncPipe, CommonModule } from '@angular/common';

var SubscriberManger = /** @class */ (function () {
    function SubscriberManger(getState) {
        this.getState = getState;
        this.selections = {};
    }
    SubscriberManger.prototype.select = function (path) {
        var sub = this.selections[path];
        if (sub) {
            return sub;
        }
        var value = get(this.getState(), path);
        var subj = new BehaviorSubject(value);
        this.selections[path] = subj;
        return subj;
    };
    SubscriberManger.prototype.createMiddleware = function () {
        var _this = this;
        return function (store) { return function (next) { return function (action) {
            var result = next(action);
            _this.broadcast(_this.getState());
            return result;
        }; }; };
    };
    SubscriberManger.prototype.broadcast = function (state) {
        if (!this.selections) {
            return;
        }
        var keys = Object.keys(this.selections);
        for (var i = keys.length - 1; i > -1; i--) {
            var path = keys[i];
            var subject = this.selections[path];
            var stateValue = get(state, path);
            if (!isEqual(stateValue, subject.getValue())) {
                subject.next(stateValue);
            }
        }
    };
    return SubscriberManger;
}());
var MapManager = /** @class */ (function () {
    function MapManager() {
        this.loaded = [];
        this.epic = {};
        this.initQueue = [];
    }
    MapManager.prototype.init = function (reduxService) {
        while (this.initQueue.length) {
            var serviceInstance = this.initQueue.shift();
            this.add(reduxService, serviceInstance);
        }
    };
    MapManager.prototype.add = function (reduxService, serviceInstance) {
        var serviceName = serviceInstance.constructor.name;
        if (!reduxService.isInitialized) {
            this.initQueue.push(serviceInstance);
            return;
        }
        var path = serviceInstance.constructor.path;
        if (!path) {
            console.error('Redux map static path not found for', serviceName);
            return;
        }
        if (this.loaded.find(function (item) { return item === path; })) {
            console.warn('Attempted to load duplicate path', path);
            return;
        }
        this.loaded.push(path);
        this.identify(reduxService, serviceInstance);
    };
    MapManager.prototype.identify = function (reduxService, serviceInstance) {
        var _this = this;
        var reducer = {};
        var keys = Object.getOwnPropertyNames(serviceInstance.constructor.prototype);
        if (keys && keys.length) {
            keys.forEach(function (propertyName) {
                var rx = get(serviceInstance.constructor.prototype[propertyName], "prototype.constructor.__rx__");
                if (rx) {
                    if (rx.epic) {
                        _this.addEpic(reduxService, serviceInstance, propertyName, rx.epic);
                    }
                    if (rx.action) {
                        _this.addAction(reduxService, serviceInstance, propertyName, rx.action, reducer);
                    }
                }
            });
        }
        if (Object.keys(reducer).length) {
            this.addReducer(reduxService, serviceInstance, reducer);
        }
    };
    MapManager.prototype.addEpic = function (reduxService, serviceInstance, propertyName, epic) {
        var actionName = serviceInstance.constructor.path + "." + epic.action;
        var list = this.epic[actionName] = this.epic[actionName] || [];
        list.push(function (action) { return serviceInstance[propertyName](action); });
    };
    MapManager.prototype.addAction = function (reduxService, serviceInstance, propertyName, action, reducer) {
        var actionName = serviceInstance.constructor.path + "." + propertyName;
        var fn = serviceInstance[propertyName]();
        fn.useOpenReducer = !!action.useOpenReducer;
        reducer[actionName] = fn;
        serviceInstance[propertyName] = function (payload) {
            reduxService.dispatch({ type: actionName, payload: payload });
        };
    };
    MapManager.prototype.addReducer = function (reduxService, serviceInstance, reducer) {
        var path = serviceInstance.constructor.path;
        var initial = serviceInstance.constructor.initial || {};
        var reducerMethod = function (state, action) {
            if (state === void 0) { state = initial; }
            var op = reducer[action.type];
            if (!op) {
                return state;
            }
            if (op.useOpenReducer) {
                return op(state, action);
            }
            var newState = cloneDeep(state);
            var payload = cloneDeep(action);
            op(newState, payload);
            return newState;
        };
        reduxService.addReducer(path, reducerMethod);
    };
    MapManager.prototype.safeDispatch = function (reduxService, action) {
        if (!action || !action.type) {
            console.warn('Redux safe dispatch called without action');
            return;
        }
        var epics = this.epic[action.type];
        if (epics) {
            epics.forEach(function (epic) { return epic(action.payload)
                .pipe(take(1))
                .subscribe(function (reply) { return reduxService.dispatch(reply); }); });
        }
    };
    return MapManager;
}());
var ReduxService = /** @class */ (function () {
    function ReduxService() {
        var _this = this;
        this.isInitialized = false;
        this.reducers = {
            '@redux-service': function (state, action) {
                if (state === void 0) { state = {}; }
                return action;
            }
        };
        this.subscriber = new SubscriberManger(function () { return _this.getState(); });
        this.map = new MapManager();
    }
    ReduxService.prototype.init = function (preloadedState, middleware, isProduction) {
        if (preloadedState === void 0) { preloadedState = {}; }
        if (middleware === void 0) { middleware = []; }
        if (isProduction === void 0) { isProduction = false; }
        var composeMiddleware = (!isProduction && window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']) || compose;
        var loadedMiddleware = composeMiddleware(applyMiddleware.apply(void 0, __spread(middleware, [this.subscriber.createMiddleware()])));
        this.store = createStore(combineReducers(this.reducers), preloadedState, loadedMiddleware);
        this.isInitialized = true;
        this.map.init(this);
    };
    ReduxService.prototype.addReducer = function (name, reducer) {
        this.reducers[name] = reducer;
        this.store.replaceReducer(combineReducers(this.reducers));
    };
    ReduxService.prototype.addMap = function (serviceInstance) {
        this.map.add(this, serviceInstance);
    };
    ReduxService.prototype.getState = function () {
        return this.store.getState();
    };
    ReduxService.prototype.dispatch = function (action) {
        this.store.dispatch(action);
        this.map.safeDispatch(this, action);
    };
    ReduxService.prototype.select = function (path) {
        return this.subscriber.select(path);
    };
    return ReduxService;
}());
ReduxService.decorators = [
    { type: Injectable },
];
ReduxService.ctorParameters = function () { return []; };
var RxStatePipe = /** @class */ (function () {
    function RxStatePipe(changeDetectorRef, reduxService) {
        this.changeDetectorRef = changeDetectorRef;
        this.reduxService = reduxService;
        this.async = new AsyncPipe(this.changeDetectorRef);
    }
    RxStatePipe.prototype.transform = function (value) {
        return this.async.transform(this.reduxService.select(value));
    };
    RxStatePipe.prototype.ngOnDestroy = function () {
        this.async.ngOnDestroy();
    };
    return RxStatePipe;
}());
RxStatePipe.decorators = [
    { type: Pipe, args: [{
                name: 'rxState',
                pure: false
            },] },
];
RxStatePipe.ctorParameters = function () { return [
    { type: ChangeDetectorRef, },
    { type: ReduxService, },
]; };
var ReduxModule = /** @class */ (function () {
    function ReduxModule() {
    }
    ReduxModule.forRoot = function () {
        return {
            ngModule: ReduxModule,
            providers: [ReduxService]
        };
    };
    return ReduxModule;
}());
ReduxModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                declarations: [RxStatePipe],
                exports: [RxStatePipe],
            },] },
];
function rxAction(useOpenReducer) {
    if (useOpenReducer === void 0) { useOpenReducer = false; }
    return function (target, propertyKey, descriptor) {
        target[propertyKey]['__rx__'] = target['__rx__'] || {};
        target[propertyKey]['__rx__'].action = {
            name: "" + propertyKey,
            useOpenReducer: useOpenReducer
        };
    };
}
function rxEpic(action) {
    return function (target, propertyKey, descriptor) {
        target[propertyKey]['__rx__'] = target['__rx__'] || {};
        target[propertyKey]['__rx__'].epic = {
            action: "" + action,
        };
    };
}

export { ReduxModule, ReduxService, rxAction, rxEpic, RxStatePipe as ɵa };
//# sourceMappingURL=angular-redux-services.js.map
