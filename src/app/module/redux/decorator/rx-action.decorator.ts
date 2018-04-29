/**
 * Configure a action for the state slice. The state and payload
 * parameters has been deep cloned. This output will be the parameter
 * state. It will not read the return output.
 * @param includeRoot Adds the root state as the third parameter.
 * @param useOpenAction Truthy to use traditional redux pattern and full dispatched action.
 * @Action(useOpenReducer) fnName(payload: T) {
 *   return (state: State, action: Action) => {
 *     state.param1 = action.payload.param1;
 *     state.param2 = action.payload.param2;
 *   };
 * }
 */
export function rxAction(includeRoot = false, useOpenAction = false) {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    target[propertyKey]['__rx__'] = target['__rx__'] || {};
    target[propertyKey]['__rx__'].action = {
      name: `${propertyKey}`,
      useOpenAction,
      includeRoot
    };
  };
}

