import { BehaviorSubject, PartialObserver } from 'rxjs';
import { baseDirectiveCreate } from '@angular/core/src/render3/instructions';

export class ReduxSubject<T> extends BehaviorSubject<T> {

  private active = 0;

  constructor(
    defaultValue: any,
    private onActivate: () => void,
    private onDeactivate: () => void) {

    super(defaultValue);

  }

  subscribe() {

    // link to
    if (this.active === 0) {
      this.onActivate();
    }

    // track the number of subscriptions
    this.active++;

    // override unsubscribe
    const subscription = super.subscribe(...Array.prototype.slice.call(arguments));
    const originalUnsub = subscription.unsubscribe.bind(subscription);
    subscription.unsubscribe = () => {
      this.active--;

      // start deactivation when there are no subscriptions
      if (!this.active) {
        this.onDeactivate();
      }

      originalUnsub();
    };

    return subscription;

  }

}
