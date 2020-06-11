import { Maybe } from '@cleavera/types';
import { ActionType } from '../constants/action-type.constant';

export class UnitAction {
    public type: ActionType;
    public amount: Maybe<number>;

    constructor(type: ActionType, amount: Maybe<number> = null) {
        this.type = type;
        this.amount = amount;
    }
}
