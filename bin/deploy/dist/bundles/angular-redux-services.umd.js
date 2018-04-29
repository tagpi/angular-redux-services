(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('lodash'), require('rxjs/operators'), require('@angular/core'), require('redux'), require('@angular/common')) :
	typeof define === 'function' && define.amd ? define('angular-redux-services', ['exports', 'rxjs', 'lodash', 'rxjs/operators', '@angular/core', 'redux', '@angular/common'], factory) :
	(factory((global['angular-redux-services'] = {}),global.rxjs,global._,global.Rx.Observable.prototype,global.ng.core,global._,global.ng.common));
}(this, (function (exports,rxjs,lodash,operators,core,redux,common) { 'use strict';

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
var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}









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

var ReduxSubject = /** @class */ (function (_super) {
    __extends(ReduxSubject, _super);
    function ReduxSubject(defaultValue, onActivate, onDeactivate) {
        var _this = _super.call(this, defaultValue) || this;
        _this.onActivate = onActivate;
        _this.onDeactivate = onDeactivate;
        _this.active = 0;
        return _this;
    }
    ReduxSubject.prototype.subscribe = function () {
        var _this = this;
        if (this.active === 0) {
            this.onActivate();
        }
        this.active++;
        var subscription = _super.prototype.subscribe.apply(this, __spread(Array.prototype.slice.call(arguments)));
        var originalUnsub = subscription.unsubscribe.bind(subscription);
        subscription.unsubscribe = function () {
            _this.active--;
            if (!_this.active) {
                _this.onDeactivate();
            }
            originalUnsub();
        };
        return subscription;
    };
    return ReduxSubject;
}(rxjs.BehaviorSubject));
var SubscriberManger = /** @class */ (function () {
    function SubscriberManger(getState) {
        this.getState = getState;
        this.selections = {};
    }
    SubscriberManger.prototype.select = function (path) {
        var _this = this;
        var sliceSub;
        var slice = this.setSlice(path);
        var onActivate = function () {
            slice.links++;
            sliceSub = slice.subscribe(function (reply) { return reduxSubject.next(reply); });
        };
        var onDeactivate = function () {
            sliceSub.unsubscribe();
            slice.links--;
            if (!slice.links) {
                _this.removeSlice(path);
            }
        };
        var reduxSubject = new ReduxSubject(slice.value, onActivate, onDeactivate);
        return reduxSubject;
    };
    SubscriberManger.prototype.setSlice = function (path) {
        var sub = this.selections[path];
        if (sub) {
            return sub;
        }
        var value = lodash.get(this.getState(), path);
        var slice = new rxjs.BehaviorSubject(value);
        slice.links = 0;
        this.selections[path] = slice;
        return slice;
    };
    SubscriberManger.prototype.removeSlice = function (path) {
        delete this.selections[path];
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
        this.loaded = {};
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
        this.identify(reduxService, serviceInstance);
    };
    MapManager.prototype.identify = function (reduxService, serviceInstance) {
        var _this = this;
        var path = serviceInstance.constructor.path;
        var reducer = (this.loaded[path] = this.loaded[path] || {});
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
        this.addResetAction(reduxService, serviceInstance, reducer);
        if (Object.keys(reducer).length) {
            this.addReducer(reduxService, serviceInstance, reducer);
        }
    };
    MapManager.prototype.addEpic = function (reduxService, serviceInstance, propertyName, epic) {
        var actionName = serviceInstance.constructor.path + "." + epic.source;
        this.epic[actionName] = this.epic[actionName] || [];
        var observer;
        var observable = rxjs.Observable.create(function (_observer) {
            observer = _observer;
        })
            .pipe(operators.flatMap(function (action) { return serviceInstance[propertyName](action); }));
        var relay = epic.relay && serviceInstance.constructor.path + "." + epic.relay;
        if (relay) {
            observable = observable.pipe(operators.map(function (result) { return ({
                type: relay,
                payload: result
            }); }));
        }
        var sub;
        if (epic.config && epic.config.cancelable) {
            this.epic[actionName].push(function (action) {
                if (sub) {
                    sub.unsubscribe();
                }
                sub = observable.subscribe(function (payload) { return reduxService.dispatch(payload); });
                observer.next(action.payload);
            });
        }
        else {
            sub = observable.subscribe(function (payload) { return reduxService.dispatch(payload); });
            this.epic[actionName].push(function (action) {
                observer.next(action.payload);
            });
        }
    };
    MapManager.prototype.addAction = function (reduxService, serviceInstance, propertyName, action, reducer) {
        var actionName = serviceInstance.constructor.path + "." + propertyName;
        switch (propertyName) {
            case reduxService.initActionType:
            case reduxService.resetActionType:
                actionName = propertyName;
                break;
        }
        var fn = serviceInstance[propertyName]();
        if (!fn) {
            return;
        }
        fn.config = action.config;
        reducer[actionName] = fn;
        serviceInstance[propertyName] = function (payload) {
            if (fn.config.includeRoot) {
                payload = payload || {};
                payload.$root = reduxService.getState();
            }
            var reply;
            if (fn.config.return) {
                var cfg_1 = fn.config.return;
                var path_1 = cfg_1.path
                    ? serviceInstance.constructor.path + "." + cfg_1.path
                    : serviceInstance.constructor.path;
                if (cfg_1 === true) {
                    reply = reduxService.select(serviceInstance.constructor.path);
                }
                else if (!cfg_1.action) {
                    reply = reduxService.select(path_1);
                }
                else {
                    reply = reduxService.select(reduxService.reduxServiceName)
                        .pipe(operators.filter(function (value) { return value === serviceInstance.constructor.path + "." + cfg_1.action; }), operators.switchMap(function () { return reduxService.select(path_1); }));
                }
            }
            reduxService.dispatch({ type: actionName, payload: payload });
            return reply;
        };
    };
    MapManager.prototype.addReducer = function (reduxService, serviceInstance, reducer) {
        var _a = serviceInstance.constructor, path = _a.path, preserve = _a.preserve;
        var initial = serviceInstance.constructor.initial || {};
        var reducerMethod = function (state, action) {
            if (state === void 0) { state = initial; }
            var op = reducer[action.type];
            if (!op) {
                return state;
            }
            if (op.config.direct) {
                return op(state, action);
            }
            var newState = lodash.cloneDeep(state);
            var payload = lodash.cloneDeep(action.payload);
            op(newState, payload);
            return newState;
        };
        reducerMethod['config'] = { path: path, preserve: preserve };
        reduxService.add(path, reducerMethod);
    };
    MapManager.prototype.safeDispatch = function (reduxService, action) {
        if (!action || !action.type) {
            console.warn('Redux safe dispatch called without action');
            return;
        }
        var epics = this.epic[action.type];
        if (epics) {
            epics.forEach(function (epicWrapper) { return epicWrapper(action); });
        }
    };
    MapManager.prototype.addResetAction = function (reduxService, serviceInstance, reducer) {
        var keys = Object.getOwnPropertyNames(serviceInstance.constructor.prototype);
        if (keys.find(function (key) { return key === reduxService.resetActionType; })) {
            return;
        }
        if (serviceInstance.constructor.preserve) {
            return;
        }
        var action = function () {
            return serviceInstance.constructor.initial || {};
        };
        action['config'] = { direct: true };
        reducer[reduxService.resetActionType] = action;
    };
    return MapManager;
}());
var ReduxService = /** @class */ (function () {
    function ReduxService() {
        var _this = this;
        this.resetActionType = '@@RESET';
        this.isInitialized = false;
        this.reducers = (_a = {}, _a[this.reduxServiceName] = function (state, action) {
                if (state === void 0) { state = {}; }
                return action.type;
            }, _a);
        this.subscriber = new SubscriberManger(function () { return _this.getState(); });
        this.map = new MapManager();
        var _a;
    }
    Object.defineProperty(ReduxService.prototype, "reduxServiceName", {
        get: function () { return '@redux-service'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReduxService.prototype, "initActionType", {
        get: function () { return '@@INIT'; },
        enumerable: true,
        configurable: true
    });
    ReduxService.prototype.init = function (preloadedState, middleware, isProduction) {
        if (preloadedState === void 0) { preloadedState = {}; }
        if (middleware === void 0) { middleware = []; }
        if (isProduction === void 0) { isProduction = false; }
        var composeMiddleware = (!isProduction && window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']) || redux.compose;
        var loadedMiddleware = composeMiddleware(redux.applyMiddleware.apply(void 0, __spread(middleware, [this.subscriber.createMiddleware()])));
        this.store = redux.createStore(redux.combineReducers(this.reducers), preloadedState, loadedMiddleware);
        this.isInitialized = true;
        this.map.init(this);
    };
    ReduxService.prototype.add = function (name, reducer) {
        this.reducers[name] = reducer;
        this.store.replaceReducer(redux.combineReducers(this.reducers));
    };
    ReduxService.prototype.register = function () {
        var _this = this;
        var services = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            services[_i] = arguments[_i];
        }
        if (arguments && arguments.length) {
            var args = Array.from(arguments);
            args.forEach(function (service) { return service && _this.map.add(_this, service); });
        }
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
    ReduxService.prototype.reset = function (clearPreserve) {
        if (clearPreserve === void 0) { clearPreserve = false; }
        this.dispatch({
            type: this.resetActionType,
            payload: { clearPreserve: clearPreserve }
        });
    };
    return ReduxService;
}());
ReduxService.decorators = [
    { type: core.Injectable, args: [{ providedIn: 'root' },] },
];
ReduxService.ctorParameters = function () { return []; };
ReduxService.ngInjectableDef = core.defineInjectable({ factory: function ReduxService_Factory() { return new ReduxService(); }, token: ReduxService, providedIn: "root" });
var RxStatePipe = /** @class */ (function () {
    function RxStatePipe(changeDetectorRef, reduxService) {
        this.changeDetectorRef = changeDetectorRef;
        this.reduxService = reduxService;
    }
    RxStatePipe.prototype.transform = function (value) {
        var _this = this;
        this.ngOnDestroy();
        this.sub = this.reduxService
            .select(value)
            .subscribe(function (innerValue) {
            _this.changeDetectorRef.markForCheck();
            _this.value = innerValue;
        });
        return this.value;
    };
    RxStatePipe.prototype.ngOnDestroy = function () {
        if (this.sub) {
            this.sub.unsubscribe();
        }
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
            },] },
];
function rxAction(config) {
    if (config === void 0) { config = {}; }
    config = config || {};
    return function (target, propertyKey, descriptor) {
        target[propertyKey]['__rx__'] = target['__rx__'] || {};
        target[propertyKey]['__rx__'].action = {
            name: "" + propertyKey,
            config: config
        };
    };
}
function rxEpic(source, relay, config) {
    if (config === void 0) { config = {}; }
    config = config || {};
    if (config.cancelable === null || config.cancelable === undefined) {
        config.cancelable = true;
    }
    return function (target, propertyKey, descriptor) {
        target[propertyKey]['__rx__'] = target['__rx__'] || {};
        target[propertyKey]['__rx__'].epic = { source: source, relay: relay, config: config };
    };
}

exports.ReduxModule = ReduxModule;
exports.ReduxService = ReduxService;
exports.rxAction = rxAction;
exports.rxEpic = rxEpic;
exports.RxStatePipe = RxStatePipe;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-redux-services.umd.js.map
