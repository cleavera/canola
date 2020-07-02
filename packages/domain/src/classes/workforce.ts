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

    public totalActionAmountForType(actionType: ActionType): number {
        return this.staff.reduce((total: number, staff: Staff): number => {
            if (staff.stats.action.type !== actionType) {
                return total;
            }

            return total + (staff.amount * (staff.stats.action.amount ?? 0));
        }, 0);
    }
}
