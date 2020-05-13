import { Funds } from './funds';
import { Ticks } from './ticks';

export class BaseTech {
    public name: string;
    public time: Ticks;
    public cost: Funds;

    constructor(name: string, time: Ticks, cost: Funds) {
        this.name = name;
        this.time = time;
        this.cost = cost;
    }
}
