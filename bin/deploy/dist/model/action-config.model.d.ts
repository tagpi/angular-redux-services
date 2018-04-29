export interface ActionConfig {
    /**
     * Adds the root state in the action.payload as $root.
     */
    includeRoot?: boolean;
    /**
     * Use the traditional redux pattern and dispatched action.
     */
    direct?: boolean;
    /**
     * Returns an observable.
     */
    return?: true | {
        /**
         * The state path to return.
         */
        path?: string;
        /**
         * Will only return if the action is called.
         */
        action?: string;
    };
}
