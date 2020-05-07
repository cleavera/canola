import { Funds } from './funds';
import { Ticks } from './ticks';

export class Insurance {
    public funds: Funds;
    public eta: Ticks;

    constructor(funds: Funds, eta: Ticks) {
        this.funds = funds;
        this.eta = eta;
    }
}
