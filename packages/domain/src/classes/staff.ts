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

    public toString(): string {
        return `${this.name} [${this.amount.toLocaleString('en')}]`;
    }

    public static ForValue(value: Funds, unit: UnitStats): Staff {
        const count: number = Math.floor(Math.floor(value.funds / unit.cost.funds));

        return new Staff(unit.name, count, unit);
    }
}
