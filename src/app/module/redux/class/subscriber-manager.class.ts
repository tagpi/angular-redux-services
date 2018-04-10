import { BehaviorSubject } from 'rxjs';
import { get, isEqual } from 'lodash';

export class SubscriberManger {

  /**
   * Tracks the active selections.
   */
  private selections: { path?: BehaviorSubject<any> } = { };

  /**
   * Create a subscriber manager
   * @param getState method that returns the full state;
   */
  constructor(private getState: () => any) {

  }

  /**
   * Get an observable for the state slice.
   * @param path
   */
  public select<T>(path: string): BehaviorSubject<T> {
    const sub = this.selections[path];
    if (sub) { return sub; }

    const value = get(this.getState(), path);
    const subj = new BehaviorSubject(value);
    this.selections[path] = subj;
    return subj;
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
