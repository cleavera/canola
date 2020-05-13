import { Mob } from './mob';
import { Staff } from './staff';

export class Outgoing {
    public mob: Mob;
    public staff: Array<Staff>;

    constructor(mob: Mob, staff: Array<Staff>) {
        this.mob = mob;
        this.staff = staff;
    }
}
