import { ActionConfig } from '../model/action-config.model';

/**
 * Configure a action for the state slice. The state and payload
 * parameters has been deep cloned. This output will be the parameter
 * state. It will not read the return output.
 * @param config Additonal action configuration
 */
export function rxAction(config: ActionConfig = {}) {

  config = config || {};

  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    target[propertyKey]['__rx__'] = target['__rx__'] || {};
    target[propertyKey]['__rx__'].action = {
      name: `${propertyKey}`,
      config
    };
  };
}

