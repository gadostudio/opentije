export class DefaultMap<T, Q> extends Map<T, Q> {
    defaultFactory: () => Q;
    constructor(defaultFactory: () => Q) {
        super();
        this.defaultFactory = defaultFactory;
    }
    get(name: T): Q {
        if (this.has(name)) {
            return super.get(name)!;
        } else {
            const value = this.defaultFactory();
            this.set(name, value);
            return value;
        }
    }
}
