import { BehaviorSubject } from 'rxjs';
export declare class SubscriberManger {
    private getState;
    /**
     * Tracks the active selections. Each subject gets updated
     * when broadcast is called.
     */
    private selections;
    /**
     * Create a subscriber manager
     * @param getState method that returns the full state;
     */
    constructor(getState: () => any);
    /**
     * Returns a redux observable for the state slice.
     * @param path
     */
    select<T>(path: string): BehaviorSubject<T>;
    /**
     * Sets the state slice.
     * @param path
     */
    private setSlice<T>(path);
    /**
     * Clear the slice.
     * @param path
     */
    private removeSlice(path);
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
