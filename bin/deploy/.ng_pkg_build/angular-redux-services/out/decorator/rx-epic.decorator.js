/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Configure an epic.
 * \@epic(action) fnName(payload) {
 *  return Observable.of({
 *    type: `${SearchExampleService.path}.setResults`,
 *    payload: [ 1, 2, 3 ]
 * });
 * }
 * @param {?} action The action name to create the epic on.
 * @return {?}
 */
export function rxEpic(action) {
    return function (target, propertyKey, descriptor) {
        target[propertyKey]['__rx__'] = target['__rx__'] || {};
        target[propertyKey]['__rx__'].epic = {
            action: `${action}`,
        };
    };
}
//# sourceMappingURL=rx-epic.decorator.js.map