import { Injectable } from '@angular/core';
import { combineReducers, createStore, Store, compose, applyMiddleware } from 'redux';
import { BehaviorSubject } from 'rxjs';

import { SubscriberManger } from '../class/subscriber-manager.class';
import { MapManager } from '../class/map-manager.class';
import { Action } from '../model/action.model';

@Injectable({ providedIn: 'root' })
export class ReduxService {

  public isInitialized = false;

  /**
   * Redux store.
   */
  private store: Store<any>;

  /**
   * Reducer list.
   */
  private reducers: any = {
    '@redux-service': (state = {}, action) => action.type
  };

  /**
   * Manages state sices into observables.
   */
  private subscriber: SubscriberManger;

  /**
   * Applies redux maps into the redux pattern.
   */
  private map: MapManager;


  constructor() {
    this.subscriber = new SubscriberManger(() => this.getState());
    this.map = new MapManager();
  }

  /**
   * Initializes the redux service
   * @param preloadedState Initial state
   * @param epics Global epics using redux-observables
   * @param isProduction Adds devtools if non production
   */
  public init(preloadedState = {}, middleware = [], isProduction = false) {

    // middleware
    const composeMiddleware = (!isProduction && window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']) || compose;
    const loadedMiddleware = composeMiddleware(applyMiddleware(
      ...middleware,
      this.subscriber.createMiddleware()
    ));

    // create store
    this.store = createStore(
      combineReducers(this.reducers),
      preloadedState,
      loadedMiddleware
    );

    // service has been initialized
    this.isInitialized = true;

    // initialize map with newly created store
    this.map.init(this);

  }

  /**
   * Add a reducer.
   * @param name Root path for the reducer (@search)
   * @param reducer Reducer method (state, action) => state
   */
  public add(name, reducer) {
    this.reducers[name] = reducer;
    this.store.replaceReducer(combineReducers(this.reducers));
  }

  /**
   * Registers a redux service instance.
   * @param serviceInstance
   */
  public register(serviceInstance: any) {
    this.map.add(this, serviceInstance);
  }

  /**
   * Return the current state.
   */
  public getState(): any {
    return this.store.getState();
  }

  /**
   * Dispact an action.
   * @param action
   */
  public dispatch(action: Action) {
    this.store.dispatch(action);
    this.map.safeDispatch(this, action);
  }

  /**
   * Subscribe to a state slice
   * @param path
   */
  public select<T>(path: string): BehaviorSubject<T> {
    return this.subscriber.select(path);
  }



}
