import { EpicConfig } from '../model/epic-config';

/**
 * Configure an epic.
 * @param source The action name to create the epic on.
 * @param relay The action name to call once the epic completes.
 * @param config Additional configuration
 */
export function rxEpic(source: string, relay?: string, config: EpicConfig = { }) {

  config = config || {};
  if (config.cancelable === null || config.cancelable === undefined) {
    config.cancelable = true;
  }

  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    target[propertyKey]['__rx__'] = target['__rx__'] || {};
    target[propertyKey]['__rx__'].epic = { source, relay, config };
  };
}

