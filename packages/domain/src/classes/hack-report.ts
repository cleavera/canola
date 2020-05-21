import { CompanyName } from './company-name';
import { Workforce } from './workforce';

export class HackReport {
    public target: CompanyName;
    public staff: Workforce;

    constructor(target: CompanyName, staff: Workforce) {
        this.target = target;
        this.staff = staff;
    }
}
