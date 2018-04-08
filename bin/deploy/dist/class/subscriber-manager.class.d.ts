import { BehaviorSubject } from 'rxjs/BehaviorSubject';
export declare class SubscriberManger {
    private getState;
    /**
     * Tracks the active selections.
     */
    private selections;
    /**
     * Create a subscriber manager
     * @param getState method that returns the full state;
     */
    constructor(getState: () => any);
    /**
     * Get an observable for the state slice.
     * @param path
     */
    select<T>(path: string): BehaviorSubject<T>;
    /**
     * Return the subscriber middleware.
     */
    createMiddleware(): (store: any) => (next: any) => (action: any) => any;
    /**
     * Update all tracked observers.
     * @param state
     */
    private broadcast(state);
}
