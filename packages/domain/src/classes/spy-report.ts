import { MobType } from '../constants/mob-type.constant';
import { Activity } from './activity';
import { ArMod } from './ar-mod';
import { BattleReport } from './battle-report';
import { CompanyName } from './company-name';
import { MobNews } from './mob-news';
import { NewsReport } from './news-report';
import { PointInTime } from './point-in-time';
import { Ticks } from './ticks';

export class SpyReport {
    public target: CompanyName;
    public reports: Array<NewsReport>;
    public incoming: Array<MobNews>;
    public outgoings: Array<MobNews>;
    public defenders: Array<CompanyName>;
    public activity: Activity;
    public arMod: ArMod;
    public hasAttacked: Array<CompanyName>;
    public hasAttackedInLastDay: Array<CompanyName>;

    constructor(target: CompanyName, reports: Array<NewsReport>, defenders: Array<CompanyName>, activity: Activity, incoming: Array<MobNews>, outgoings: Array<MobNews>, arMod: ArMod, hasAttacked: Array<CompanyName>, hasAttackedInLastDay: Array<CompanyName>) {
        this.target = target;
        this.reports = reports;
        this.incoming = incoming;
        this.outgoings = outgoings;
        this.defenders = defenders;
        this.activity = activity;
        this.arMod = arMod;
        this.hasAttacked = hasAttacked;
        this.hasAttackedInLastDay = hasAttackedInLastDay;
    }

    public static ForReports(reports: Array<NewsReport>, currentPointInTime: PointInTime, target: CompanyName): SpyReport {
        let arMod: ArMod | null = null;
        const incoming: Array<MobNews> = [];
        const outgoings: Array<MobNews> = [];
        const defenders: Record<string, CompanyName> = {};
        const hasAttacked: Record<string, CompanyName> = {};
        const hasAttackedInLastDay: Record<string, CompanyName> = {};
        const activity: Array<PointInTime> = [];

        for (const report of reports) {
            const tickDifference: Ticks = PointInTime.Subtract(currentPointInTime, report.time);

            if (arMod === null && NewsReport.isBattle(report) && BattleReport.isDefendingSelf(report.content, target)) {
                arMod = ArMod.AdjustForTime(ArMod.Max(), tickDifference);
            }
            
            if (NewsReport.isBattle(report) && BattleReport.isAttacking(report.content)) {
                const mob: MobNews = report.content;
                const idAttacked: CompanyName | null = this._getAttacking(mob);
                
                if (idAttacked !== null) {
                    hasAttacked[idAttacked.id] = idAttacked;
                }
                
                if (idAttacked !== null && tickDifference.ticks < 145) {
                    hasAttackedInLastDay[idAttacked.id] = idAttacked;
                }
                

            if (NewsReport.isMob(report)) {
                const mob: MobNews = report.content;
                const defender: CompanyName | null = this._getDefender(mob);

                if (defender !== null) {
                    defenders[defender.id] = defender;
                }

                if (mob.isOutgoing) {
                    activity.push(report.time);
                }

                if (mob.mob !== null) {
                    if (mob.isOutgoing) {
                        // eslint-disable-next-line max-depth
                        if (!outgoings.some((outgoing: MobNews) => {
                            return outgoing.mob?.target.id === mob.mob?.target.id;
                        })) {
                            outgoings.push(mob);
                        }
                    } else if (!incoming.some((mobNews: MobNews) => {
                        return mobNews.mob?.sender.id === mob.mob?.sender.id;
                    })) {
                        incoming.push(mob);
                    }
                }
            }
        }

        if (arMod === null) {
            arMod = ArMod.Min();
        }

        return new SpyReport(target, reports, Object.values(defenders), new Activity(activity), incoming, outgoings, arMod, Object.values(hasAttacked), Object.values(hasAttackedInLastDay));
    }

    private static _getDefender(mob: MobNews): CompanyName | null {
        if (mob.originalMob.type !== MobType.DEFENDING) {
            return null;
        }

        let defender: CompanyName = mob.originalMob.sender;

        if (mob.isOutgoing) {
            defender = mob.originalMob.target;
        }

        if (CompanyName.is(defender, CompanyName.Government())) {
            return null;
        }

        return defender;
    }
        
    private static _getAttacking(mob: MobNews): CompanyName | null {
        if (mob.originalMob.type !== MobType.ATTACKING) {
            return null;
        }

        let attacking: CompanyName = mob.originalMob.target;

        if (mob.isOutgoing) {
            attacking = mob.originalMob.target;
        }

        return attacking;
    }
}
