import { get, cloneDeep } from 'lodash';
import { ReduxService } from '../service/redux.service';
import { Action } from '../model/action.model';
import { take, map, flatMap } from 'rxjs/operators';
import { Observable, Observer, Subscription } from 'rxjs';

export class MapManager {

  /**
   * Tracks the loaded services
   */
  private loaded: { [path: string]: any } = {};

  /**
   * Safe epic list. Only gets triggered when dispatched through this service.
   * For global triggered epics, Use redux-observable via epics param in the
   * init function.
   */
  private epic: { actionType?: any } = { };

  /**
   * Tracks added services prior to store initialization.
   */
  private initQueue: any[] = [];

  /**
   * Process queued services
   * @param reduxService
   */
  public init(reduxService: ReduxService) {
    while (this.initQueue.length) {
      const serviceInstance = this.initQueue.shift();
      this.add(reduxService, serviceInstance);
    }
  }

  /**
   * Add a redux map service class instance.
   * @param reduxService Redux service that will consume it
   * @param serviceInstance Service instance of the class
   */
  public add(reduxService: ReduxService, serviceInstance: any) {

    const serviceName = serviceInstance.constructor.name;

    // check if redux service is initialized
    if (!reduxService.isInitialized) {
      this.initQueue.push(serviceInstance);
      return;
    }

    // identify path
    const path = serviceInstance.constructor.path;
    if (!path) {
      console.error('Redux map static path not found for', serviceName);
      return;
    }

    // identify properties
    this.identify(reduxService, serviceInstance);

  }

  /**
   * Convert the map to the redux flow
   * @param reduxService
   * @param serviceInstance
   */
  private identify(reduxService: ReduxService, serviceInstance: any) {

    const path = serviceInstance.constructor.path;
    const reducer = (this.loaded[path] = this.loaded[path] || {});

    // identify parts
    const keys = Object.getOwnPropertyNames(serviceInstance.constructor.prototype);
    if (keys && keys.length) {
      keys.forEach(propertyName => {
        const rx = get(serviceInstance.constructor.prototype[propertyName], `prototype.constructor.__rx__`);
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

    // create reset action
    this.addResetAction(reduxService, serviceInstance, reducer);

    // finalize reducer
    if (Object.keys(reducer).length) {
      this.addReducer(reduxService, serviceInstance, reducer);
    }

  }

  /**
   * Add an epic.
   */
  private addEpic(reduxService: ReduxService, serviceInstance: any, propertyName: string, epic: any) {

    const actionName = `${serviceInstance.constructor.path}.${epic.source}`;
    this.epic[actionName] = this.epic[actionName] || [];

    // create single observable for the epic instance
    // warning: this observer is never destroyed
    let observer: Observer<any>;
    let observable = Observable.create(_observer => {
      observer = _observer;
    })

    // return the observabel from the epic function
    .pipe(flatMap(action => serviceInstance[propertyName](action)));

    // add the relay output if provided
    const relay = epic.relay && `${serviceInstance.constructor.path}.${epic.relay}`;
    if (relay) {
      observable = observable.pipe(map(result => ({
        type: relay,
        payload: result
      })));
    }

    const cancelable = epic.cancelable && `${serviceInstance.constructor.path}.${epic.cancelable}`;
    let sub: Subscription;

    // emit from epic
    if (cancelable) {
      this.epic[actionName].push((action: Action) => {
        if (sub) { sub.unsubscribe(); }
        sub = observable.subscribe(payload => reduxService.dispatch(payload));
        observer.next(action.payload);
      });

    // single stream observable
    } else {
      sub = observable.subscribe(payload => reduxService.dispatch(payload));
      this.epic[actionName].push((action: Action) => {
        observer.next(action.payload);
      });
    }

  }

  /**
   * Add an action
   */
  private addAction(reduxService: ReduxService, serviceInstance: any, propertyName: string, action: any, reducer: any) {
    const actionName = `${serviceInstance.constructor.path}.${propertyName}`;
    const fn = serviceInstance[propertyName]();
    if (!fn) { return; }
    fn.useOpenAction = !!action.useOpenAction;
    fn.includeRoot = !!action.includeRoot;
    reducer[actionName] = fn;
    serviceInstance[propertyName] = (payload: any) => {
      if (fn.includeRoot) {
        payload = payload || {};
        payload.$root = reduxService.getState();
      }
      reduxService.dispatch({ type: actionName, payload });
    };
  }

  /**
   * Add a reducer.
   */
  private addReducer(reduxService: ReduxService, serviceInstance: any, reducer: any) {
    const { path, preserve } = serviceInstance.constructor;
    const initial = serviceInstance.constructor.initial || {};
    const reducerMethod = (state: any = initial, action: Action) => {

      const op = reducer[action.type];
      if (!op) { return state; }
      if (op.useOpenAction) { return op(state, action); }

      const newState = cloneDeep(state);
      const payload = cloneDeep(action.payload);
      op(newState, payload);
      return newState;

    };
    reducerMethod['config'] = { path, preserve };
    reduxService.add(path, reducerMethod);
  }

  /**
   * Trigger the safe epics.
   * @param action
   */
  public safeDispatch(reduxService: ReduxService, action: Action) {

    if (!action || !action.type) {
      console.warn('Redux safe dispatch called without action');
      return;
    }

    const epics = this.epic[action.type];
    if (epics) {
      epics.forEach(epicWrapper => epicWrapper(action));
    }

  }

  /**
   * Creates the reset action.
   */
  private addResetAction(reduxService: ReduxService, serviceInstance: any, reducer: any) {

    // do not create reset action if it has been overriden
    const keys = Object.getOwnPropertyNames(serviceInstance.constructor.prototype);
    if (keys.find(key => key === reduxService.resetActionType)) {
      return;
    }

    // do not create a reset action if preserve is set
    if (serviceInstance.constructor.preserve) {
      return;
    }

    // reset to initial
    const action = () => {
      return serviceInstance.constructor.initial || {};
    };
    action['useOpenAction'] = true;
    reducer[reduxService.resetActionType] = action;

  }

}
