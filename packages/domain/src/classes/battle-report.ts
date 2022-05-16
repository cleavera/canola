import { MobType } from '../constants/mob-type.constant';
import { CompanyName } from './company-name';

export class BattleReport {
    public target: CompanyName;
    public type: MobType;

    constructor(target: CompanyName, type: MobType) {
        this.target = target;
        this.type = type;
    }

    public static isDefendingSelf(report: BattleReport, selfCompany: CompanyName): boolean {
        return report.type === MobType.DEFENDING && CompanyName.is(report.target, selfCompany);
    }

    public static isAttacking(report: BattleReport): boolean {
        return report.type === MobType.ATTACKING;
    }

    public static getTarget(report: BattleReport): CompanyName {
        return report.target;
    }

}
