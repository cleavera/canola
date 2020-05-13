import { Funds } from './funds';

export class UnitStats {
    public name: string;
    public cost: Funds;

    constructor(name: string, cost: Funds) {
        this.name = name;
        this.cost = cost;
    }

    public static HamsterFromHell(): UnitStats {
        return new UnitStats('Hamster from Hell', new Funds(45000));
    }
}
