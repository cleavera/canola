import { Funds } from './funds';
import { Mob } from './mob';
import { Staff } from './staff';

export class Outgoing {
    public mob: Mob;
    public staff: Array<Staff> | null;

    constructor(mob: Mob, staff: Array<Staff> | null = null) {
        this.mob = mob;
        this.staff = staff;
    }

    public value(): Funds | null {
        if (this.staff === null) {
            return null;
        }

        return Funds.Sum(...this.staff.map((staff: Staff) => {
            return staff.value();
        }));
    }
}
