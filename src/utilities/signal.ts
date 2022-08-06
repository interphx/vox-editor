export interface SubscriptionHandle {
    unsubscribe(): void;
}

interface Subscription<T> extends SubscriptionHandle {
    callback: (arg: T) => void;
}

export interface SignalObservable<T> {
    subscribe(callback: (arg: T) => void): SubscriptionHandle;
}

export class Signal<T> implements SignalObservable<T> {
    private isDispatching: boolean = false;
    private cleanupRequired: boolean = false;
    private readonly subscriptions: (Subscription<T> | null)[] = [];

    subscribe(callback: (arg: T) => void): SubscriptionHandle {
        const subscription = {
            callback,
            unsubscribe: () => this.removeSubscription(subscription)
        };
        this.subscriptions.push(subscription);
        return subscription;
    }

    dispatch(arg: T): void {
        this.isDispatching = true;
        for (const subscription of this.subscriptions) {
            if (!subscription) continue;
            const callback = subscription.callback;
            callback(arg);
        }
        this.isDispatching = false;

        // Subscriptions removed during dispatch are replaced
        // with null to avoid messing with the indices.
        // They are cleaned up after dispatch.
        if (this.cleanupRequired) {
            this.cleanupRequired = false;
            for (let i = this.subscriptions.length - 1; i >= 0; --i) {
                if (this.subscriptions[i] === null) this.subscriptions.splice(i, 1);
            }
        }
    }

    private removeSubscription(subscription: Subscription<T>): void {
        const index = this.subscriptions.indexOf(subscription);
        if (index >= 0) {
            if (this.isDispatching) {
                this.subscriptions[index] = null;
                this.cleanupRequired = true;
            } else {
                this.subscriptions.splice(index, 1);
            }
        }
    }
}
