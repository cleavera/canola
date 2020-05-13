import { DevelopmentType } from '../constants/development-type.constant';
import { Funds } from './funds';
import { Ticks } from './ticks';

export class BaseTech {
    public name: string;
    public time: Ticks;
    public cost: Funds;
    public type: DevelopmentType;

    constructor(name: string, time: Ticks, cost: Funds, developmentType: DevelopmentType) {
        this.name = name;
        this.time = time;
        this.cost = cost;
        this.type = developmentType;
    }
}
