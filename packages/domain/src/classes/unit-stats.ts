import { ActionType } from '../constants/action-type.constant';
import { Funds } from './funds';
import { UnitAction } from './unit-action';

export class UnitStats {
    public name: string;
    public cost: Funds;
    public isStealth: boolean;
    public action: UnitAction;

    constructor(name: string, cost: Funds, action: UnitAction, isStealth: boolean = false) {
        this.name = name;
        this.cost = cost;
        this.isStealth = isStealth;
        this.action = action;
    }

    public static HamsterFromHell(): UnitStats {
        return new UnitStats('Hamster from Hell', new Funds(45000), new UnitAction(ActionType.KILLS));
    }
}
