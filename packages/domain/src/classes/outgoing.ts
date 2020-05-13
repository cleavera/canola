import { Funds } from './funds';
import { Mob } from './mob';
import { Staff } from './staff';

export class Outgoing {
    public mob: Mob;
    public staff: Array<Staff>;

    constructor(mob: Mob, staff: Array<Staff>) {
        this.mob = mob;
        this.staff = staff;
    }

    public value(): Funds {
        return Funds.Sum(...this.staff.map((staff: Staff) => {
            return staff.value();
        }));
    }
}
