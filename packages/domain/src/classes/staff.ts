import { Funds } from './funds';
import { UnitStats } from './unit-stats';

export class Staff {
    public readonly name: string;
    public readonly amount: number;
    public readonly stats: UnitStats;

    constructor(name: string, amount: number, stats: UnitStats) {
        this.name = name;
        this.amount = amount;
        this.stats = stats;
    }

    public value(): Funds {
        return Funds.Scale(this.stats.cost, this.amount);
    }
}
