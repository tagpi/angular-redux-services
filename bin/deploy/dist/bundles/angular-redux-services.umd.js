(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs/BehaviorSubject'), require('lodash'), require('rxjs/add/operator/take'), require('@angular/core'), require('redux'), require('redux-observable'), require('@angular/common')) :
	typeof define === 'function' && define.amd ? define('angular-redux-services', ['exports', 'rxjs/BehaviorSubject', 'lodash', 'rxjs/add/operator/take', '@angular/core', 'redux', 'redux-observable', '@angular/common'], factory) :
	(factory((global['angular-redux-services'] = {}),global.Rx,global._,global.Rx.Observable.prototype,global.ng.core,global._,global._,global.ng.common));
}(this, (function (exports,BehaviorSubject,lodash,take,core,redux,reduxObservable,common) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */










function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

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
        var value = lodash.get(this.getState(), path);
        var subj = new BehaviorSubject.BehaviorSubject(value);
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
            if (!subject.observers.length) {
                subject.complete();
                delete this.selections[path];
                return;
            }
            var stateValue = lodash.get(state, path);
            if (!lodash.isEqual(stateValue, subject.getValue())) {
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
                var rx = lodash.get(serviceInstance.constructor.prototype[propertyName], "prototype.constructor.__rx__");
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
            var newState = lodash.cloneDeep(state);
            var payload = lodash.cloneDeep(action);
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
                .take(1)
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
    ReduxService.prototype.init = function (preloadedState, epics, isProduction) {
        if (preloadedState === void 0) { preloadedState = {}; }
        if (epics === void 0) { epics = []; }
        if (isProduction === void 0) { isProduction = false; }
        var composeMiddleware = (!isProduction && window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']) || redux.compose;
        var middleware = composeMiddleware(redux.applyMiddleware(reduxObservable.createEpicMiddleware(reduxObservable.combineEpics.apply(void 0, __spread(epics))), this.subscriber.createMiddleware()));
        this.store = redux.createStore(redux.combineReducers(this.reducers), preloadedState, middleware);
        this.isInitialized = true;
        this.map.init(this);
    };
    ReduxService.prototype.addReducer = function (name, reducer) {
        this.reducers[name] = reducer;
        this.store.replaceReducer(redux.combineReducers(this.reducers));
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
    { type: core.Injectable },
];
ReduxService.ctorParameters = function () { return []; };
var RxStatePipe = /** @class */ (function () {
    function RxStatePipe(changeDetectorRef, reduxService) {
        this.changeDetectorRef = changeDetectorRef;
        this.reduxService = reduxService;
        this.async = new common.AsyncPipe(this.changeDetectorRef);
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
    { type: core.Pipe, args: [{
                name: 'rxState',
                pure: false
            },] },
];
RxStatePipe.ctorParameters = function () { return [
    { type: core.ChangeDetectorRef, },
    { type: ReduxService, },
]; };
var ReduxModule = /** @class */ (function () {
    function ReduxModule() {
    }
    return ReduxModule;
}());
ReduxModule.decorators = [
    { type: core.NgModule, args: [{
                imports: [common.CommonModule],
                declarations: [RxStatePipe],
                exports: [RxStatePipe],
                providers: [ReduxService]
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

exports.ReduxModule = ReduxModule;
exports.ReduxService = ReduxService;
exports.rxAction = rxAction;
exports.rxEpic = rxEpic;
exports.ɵa = RxStatePipe;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-redux-services.umd.js.map