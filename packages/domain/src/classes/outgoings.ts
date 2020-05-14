import { Outgoing } from './outgoing';

export class Outgoings {
    public readonly outgoings: ReadonlyArray<Outgoing>;

    constructor(outgoings: Array<Outgoing>) {
        this.outgoings = outgoings;
    }
}
