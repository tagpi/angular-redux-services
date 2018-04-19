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
export declare function rxEpic(action: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
