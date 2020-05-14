import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { Funds } from './funds';
import { Mob } from './mob';
import { Staff } from './staff';

export class Outgoing {
    public mob: Mob;
    public staff: Maybe<Array<Staff>>;

    constructor(mob: Mob, staff: Maybe<Array<Staff>> = null) {
        this.mob = mob;
        this.staff = staff;
    }

    public value(): Maybe<Funds> {
        if (isNull(this.staff)) {
            return null;
        }

        return Funds.Sum(...this.staff.map((staff: Staff) => {
            return staff.value();
        }));
    }
}
