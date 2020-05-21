import { CompanyName } from './company-name';
import { Land } from './land';
import { Stocks } from './stocks';

export class DriveByReport {
    public target: CompanyName;
    public land: Land;
    public stocks: Stocks;

    constructor(target: CompanyName, land: Land, stocks: Stocks) {
        this.target = target;
        this.land = land;
        this.stocks = stocks;
    }
}
