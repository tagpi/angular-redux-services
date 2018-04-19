import { BehaviorSubject, Subscription } from 'rxjs';
import { get, isEqual } from 'lodash';
import { ReduxSubject } from './redux-subject.class';

export class SubscriberManger {

  /**
   * Tracks the active selections. Each subject gets updated
   * when broadcast is called.
   */
  private selections: { path?: BehaviorSubject<any> } = { };

  /**
   * Create a subscriber manager
   * @param getState method that returns the full state;
   */
  constructor(private getState: () => any) {

  }

  /**
   * Returns a redux observable for the state slice.
   * @param path
   */
  public select<T>(path: string): BehaviorSubject<T> {

    let sliceSub: Subscription;
    const slice = this.setSlice<T>(path);

    const onActivate = () => {
      slice.links++;
      sliceSub = slice.subscribe((reply: T) => reduxSubject.next(reply));
    };

    const onDeactivate = () => {
      sliceSub.unsubscribe();
      slice.links--;
      if (!slice.links) {
        this.removeSlice(path);
      }
    };

    const reduxSubject = new ReduxSubject<T>(slice.value, onActivate, onDeactivate);
    return reduxSubject;

  }

  /**
   * Sets the state slice.
   * @param path
   */
  private setSlice<T>(path: string): BehaviorSubject<T> & { links?: number } {
    const sub = this.selections[path];
    if (sub) { return sub; }

    const value = get(this.getState(), path);
    const slice: BehaviorSubject<T> & { links?: number } = new BehaviorSubject(value);
    slice.links = 0;

    this.selections[path] = slice;
    return slice;
  }

  /**
   * Clear the slice.
   * @param path
   */
  private removeSlice(path: string) {
    delete this.selections[path];
  }

  /**
   * Return the subscriber middleware.
   */
  public createMiddleware() {
    return store => next => action => {
      const result = next(action);
      this.broadcast(this.getState());
      return result;
    };
  }

  /**
   * Update all tracked observers.
   * @param state
   */
  private broadcast(state) {
    if (!this.selections) { return; }

    const keys = Object.keys(this.selections);
    for (let i = keys.length - 1; i > -1; i--) {
      const path = keys[i];
      const subject = this.selections[path];
      const stateValue = get(state, path);
      if (!isEqual(stateValue, subject.getValue())) {
        subject.next(stateValue);
      }

    }
  }

}
