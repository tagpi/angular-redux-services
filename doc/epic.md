# rxEpic

Configure an epic or effect from the method. The rxEpic decorator takes in three parameters:

* source - The action name to create the epic on.
* relay - The action name to call once the epic completes.
* config - Additional configuration

Add the config to customize the epic method.

```typescript
export interface EpicConfig {

  /**
   * Will cause the epic to unsubscribe every emit. Defaults to true.
   */
  cancelable?: boolean;

}
```