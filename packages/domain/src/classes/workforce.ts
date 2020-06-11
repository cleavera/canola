import { ActionType } from '../constants/action-type.constant';
import { Funds } from './funds';
import { Staff } from './staff';

export class Workforce {
    public readonly staff: ReadonlyArray<Staff>;

    constructor(staff: Array<Staff>) {
        this.staff = staff;
    }

    public value(): Funds {
        return Funds.Sum(...this.staff.map((staff: Staff) => {
            return staff.value();
        }));
    }

    public getForActionType(actionType: ActionType): Workforce {
        return new Workforce(this.staff.filter((staff: Staff) => {
            return staff.stats.action.type === actionType;
        }));
    }
}
