import { ActionType } from '../constants/action-type.constant';

export class UnitAction {
    public type: ActionType;
    public amount: number | null;

    constructor(type: ActionType, amount: number | null = null) {
        this.type = type;
        this.amount = amount;
    }
}
