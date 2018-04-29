import { EpicConfig } from '../model/epic-config';
/**
 * Configure an epic.
 * @param source The action name to create the epic on.
 * @param relay The action name to call once the epic completes.
 * @param config Additional configuration
 */
export declare function rxEpic(source: string, relay?: string, config?: EpicConfig): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
