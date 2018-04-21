import { get, cloneDeep } from 'lodash';
import { ReduxService } from '../service/redux.service';
import { Action } from '../model/action.model';
import { take, map } from 'rxjs/operators';

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
    const list = (this.epic[actionName] = this.epic[actionName] || []);
    const relay = epic.relay && `${serviceInstance.constructor.path}.${epic.relay}`;

    list.push((action: Action) => {

      let epic$ = serviceInstance[propertyName](action);

      if (relay) {
        epic$ = epic$.pipe(map(result => ({
          type: relay,
          payload: result
        })));
      }

      epic$ = epic$.pipe(take(1));

      // run the relay action
      epic$.subscribe(reply => reduxService.dispatch(reply));

    });

  }

  /**
   * Add an action
   */
  private addAction(reduxService: ReduxService, serviceInstance: any, propertyName: string, action: any, reducer: any) {
    const actionName = `${serviceInstance.constructor.path}.${propertyName}`;
    const fn = serviceInstance[propertyName]();
    if (!fn) { return; }
    fn.useOpenAction = !!action.useOpenAction;
    reducer[actionName] = fn;
    serviceInstance[propertyName] = (payload: any) => {
      reduxService.dispatch({ type: actionName, payload });
    };
  }

  /**
   * Add a reducer.
   */
  private addReducer(reduxService: ReduxService, serviceInstance: any, reducer: any) {
    const path = serviceInstance.constructor.path;
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
      epics.forEach(epicWrapper => epicWrapper());
    }

  }

}
