import { Funds } from './funds';
import { Outgoing } from './outgoing';

export class Outgoings {
    public readonly outgoings: ReadonlyArray<Outgoing>;

    constructor(outgoings: Array<Outgoing>) {
        this.outgoings = outgoings;
    }

    public value(): Funds {
        return Funds.Sum(...this.outgoings.map((outgoing: Outgoing) => {
            return outgoing.value();
        }));
    }
}
