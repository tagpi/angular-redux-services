/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Configure a action for the state slice. The state and payload
 * parameters has been deep cloned. This output will be the parameter
 * state. It will not read the return output.
 * \@Action(useOpenReducer) fnName(payload: T) {
 *   return (state: State, action: Action) => {
 *     state.param1 = action.payload.param1;
 *     state.param2 = action.payload.param2;
 *   };
 * }
 * @param {?=} useOpenAction Truthy to use traditional redux pattern and full dispatched action.
 * @param {?=} useCompleteAction
 * @return {?}
 */
export function rxAction(useOpenAction = false, useCompleteAction = false) {
    return function (target, propertyKey, descriptor) {
        target[propertyKey]['__rx__'] = target['__rx__'] || {};
        target[propertyKey]['__rx__'].action = {
            name: `${propertyKey}`,
            useOpenAction
        };
    };
}
//# sourceMappingURL=rx-action.decorator.js.map