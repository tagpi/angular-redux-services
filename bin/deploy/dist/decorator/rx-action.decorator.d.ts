import { ActionConfig } from '../model/action-config.model';
/**
 * Configure a action for the state slice. The state and payload
 * parameters has been deep cloned. This output will be the parameter
 * state. It will not read the return output.
 * @param config Additonal action configuration
 */
export declare function rxAction(config?: ActionConfig): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
