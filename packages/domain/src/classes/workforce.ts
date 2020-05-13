import { Staff } from './staff';

export class Workforce {
    public readonly staff: ReadonlyArray<Staff>;

    constructor(staff: Array<Staff>) {
        this.staff = staff;
    }
}
