import { MobDirection } from '../constants/mob-direction.constant';
import { MobType } from '../constants/mob-type.constant';
import { CompanyName } from './company-name';
import { Ticks } from './ticks';

export class Mob {
    public static readonly THERE_FOR_TICKS: Ticks = new Ticks(3);

    public target: CompanyName;
    public eta: Ticks;
    public direction: MobDirection;
    public type: MobType | null;
    public sender: CompanyName;

    constructor(sender: CompanyName, target: CompanyName, eta: Ticks, direction: MobDirection, type: MobType | null = null) {
        this.sender = sender;
        this.target = target;
        this.eta = eta;
        this.direction = direction;
        this.type = type;
    }
}
