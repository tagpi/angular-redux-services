import { ReduxService } from '../service/redux.service';
import { Action } from '../model/action.model';
export declare class MapManager {
    /**
     * Tracks the loaded services
     */
    private loaded;
    /**
     * Safe epic list. Only gets triggered when dispatched through this service.
     * For global triggered epics, Use redux-observable via epics param in the
     * init function.
     */
    private epic;
    /**
     * Tracks added services prior to store initialization.
     */
    private initQueue;
    /**
     * Process queued services
     * @param reduxService
     */
    init(reduxService: ReduxService): void;
    /**
     * Add a redux map service class instance.
     * @param reduxService Redux service that will consume it
     * @param serviceInstance Service instance of the class
     */
    add(reduxService: ReduxService, serviceInstance: any): void;
    /**
     * Convert the map to the redux flow
     * @param reduxService
     * @param serviceInstance
     */
    private identify(reduxService, serviceInstance);
    /**
     * Add an epic.
     */
    private addEpic(reduxService, serviceInstance, propertyName, epic);
    /**
     * Add an action
     */
    private addAction(reduxService, serviceInstance, propertyName, action, reducer);
    /**
     * Add a reducer.
     */
    private addReducer(reduxService, serviceInstance, reducer);
    /**
     * Trigger the safe epics.
     * @param action
     */
    safeDispatch(reduxService: ReduxService, action: Action): void;
    /**
     * Creates the reset action.
     */
    private addResetAction(reduxService, serviceInstance, reducer);
}
