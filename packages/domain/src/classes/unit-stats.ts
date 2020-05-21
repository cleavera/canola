import { Funds } from './funds';

export class UnitStats {
    public name: string;
    public cost: Funds;
    public isStealth: boolean;

    constructor(name: string, cost: Funds, isStealth: boolean = false) {
        this.name = name;
        this.cost = cost;
        this.isStealth = isStealth;
    }

    public static HamsterFromHell(): UnitStats {
        return new UnitStats('Hamster from Hell', new Funds(45000));
    }
}
