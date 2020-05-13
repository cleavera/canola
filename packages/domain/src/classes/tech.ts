import { Development } from './development';
import { Funds } from './funds';

export class Tech {
    public readonly developments: ReadonlyArray<Development>;

    constructor(developments: Array<Development>) {
        this.developments = developments;
    }

    public completed(): Array<Development> {
        return this.developments.filter((development: Development) => {
            return development.completed;
        });
    }

    public value(): Funds {
        return Funds.Sum(...this.completed().map((development: Development) => {
            return development.base.cost;
        }));
    }
}
