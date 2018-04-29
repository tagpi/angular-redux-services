# rxAction

Create an action and reducer as a method in a redux service. The state and payload parameters has been deep cloned. This reducer output will be the parameter state. It will not read the return output.

Add the config to customize the action method.

```typescript
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
```