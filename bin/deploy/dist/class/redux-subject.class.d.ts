import { BehaviorSubject, Subscription } from 'rxjs';
export declare class ReduxSubject<T> extends BehaviorSubject<T> {
    private onActivate;
    private onDeactivate;
    private active;
    constructor(defaultValue: any, onActivate: () => void, onDeactivate: () => void);
    subscribe(): Subscription;
}
