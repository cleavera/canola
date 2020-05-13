import { Funds } from './funds';
import { Injury } from './injury';

export class Injuries {
    public readonly injuries: ReadonlyArray<Injury>;

    constructor(injuries: Array<Injury>) {
        this.injuries = injuries;
    }

    public totalNumber(): number {
        return this.injuries.reduce((sum: number, injury: Injury) => {
            return sum + injury.staff.amount;
        }, 0);
    }

    public value(): Funds {
        return Funds.Sum(...this.injuries.map((injury: Injury) => {
            return injury.staff.value();
        }));
    }
}
