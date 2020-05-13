import { Maybe } from '@cleavera/types';
import { MobDirection } from '../constants/mob-direction.constant';
import { MobType } from '../constants/mob-type.constant';
import { CompanyName } from './company-name';
import { Ticks } from './ticks';

export class Mob {
    public target: CompanyName;
    public eta: Ticks;
    public direction: MobDirection;
    public type: Maybe<MobType>;

    constructor(target: CompanyName, eta: Ticks, direction: MobDirection, type: Maybe<MobType> = null) {
        this.target = target;
        this.eta = eta;
        this.direction = direction;
        this.type = type;
    }
}
