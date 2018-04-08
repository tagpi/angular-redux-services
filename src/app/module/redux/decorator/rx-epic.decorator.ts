/**
 * Configure an epic.
 * @param action The action name to create the epic on.
 * @epic(action) fnName(payload) {
 *  return Observable.of({
 *    type: `${SearchExampleService.path}.setResults`,
 *    payload: [ 1, 2, 3 ]
  * });
 * }
 */
export function rxEpic(action: string) {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    target[propertyKey]['__rx__'] = target['__rx__'] || {};
    target[propertyKey]['__rx__'].epic = {
      action: `${action}`,
    };
  };
}

