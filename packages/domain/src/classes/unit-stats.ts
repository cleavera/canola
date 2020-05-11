import { Funds } from './funds';

export class UnitStats {
    public name: string;
    public cost: Funds;

    constructor(name: string, cost: Funds) {
        this.name = name;
        this.cost = cost;
    }
}
