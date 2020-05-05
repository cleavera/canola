import { Staff } from './staff';
import { Ticks } from './ticks';

export class Injury {
    public staff: Staff;
    public eta: Ticks;

    constructor(staff: Staff, eta: Ticks) {
        this.staff = staff;
        this.eta = eta;
    }
}
