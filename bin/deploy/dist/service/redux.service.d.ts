import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Action } from '../model/action.model';
export declare class ReduxService {
    isInitialized: boolean;
    /**
     * Redux store.
     */
    private store;
    /**
     * Reducer list.
     */
    private reducers;
    /**
     * Manages state sices into observables.
     */
    private subscriber;
    /**
     * Applies redux maps into the redux pattern.
     */
    private map;
    constructor();
    /**
     * Initializes the redux service
     * @param preloadedState Initial state
     * @param epics Global epics using redux-observables
     * @param isProduction Adds devtools if non production
     */
    init(preloadedState?: {}, epics?: any[], isProduction?: boolean): void;
    /**
     * Add a reducer.
     * @param name Root path for the reducer (@search)
     * @param reducer Reducer method (state, action) => state
     */
    addReducer(name: any, reducer: any): void;
    /**
     * Add a redux map.
     * @param serviceInstance
     */
    addMap(serviceInstance: any): void;
    /**
     * Return the current state.
     */
    getState(): any;
    /**
     * Dispact an action.
     * @param action
     */
    dispatch(action: Action): void;
    /**
     * Subscribe to a state slice
     * @param path
     */
    select<T>(path: string): BehaviorSubject<T>;
}
