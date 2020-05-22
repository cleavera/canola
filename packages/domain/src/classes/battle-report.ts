import { MobType } from '../constants/mob-type.constant';
import { CompanyName } from './company-name';

export class BattleReport {
    public target: CompanyName;
    public type: MobType;

    constructor(target: CompanyName, type: MobType) {
        this.target = target;
        this.type = type;
    }
}
