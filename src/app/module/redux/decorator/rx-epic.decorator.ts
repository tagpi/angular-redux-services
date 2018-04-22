/**
 * Configure an epic.
 * @param source The action name to create the epic on.
 * @param relay The action name to call once the epic completes.
 * @param cancelable The epic will unsubscribe then subscribe every emit.
 * @epic(source, relay) fnName(payload) {
 *  return Observable.of([ 1, 2, 3 ]);
 * }
 */
export function rxEpic(source: string, relay?: string, cancelable = true) {
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    target[propertyKey]['__rx__'] = target['__rx__'] || {};
    target[propertyKey]['__rx__'].epic = { source, relay, cancelable };
  };
}

