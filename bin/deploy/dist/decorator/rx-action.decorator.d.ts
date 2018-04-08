/**
 * Configure a action for the state slice. The state and payload
 * parameters has been deep cloned. This output will be the parameter
 * state. It will not read the return output.
 * @param useOpenReducer Truthy to use traditional redux pattern.
 * @Action(useOpenReducer) fnName(payload: T) {
 *   return (state: State, action: Action) => {
 *     state.param1 = action.payload.param1;
 *     state.param2 = action.payload.param2;
 *   };
 * }
 */
export declare function rxAction(useOpenReducer?: boolean): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
