import { IDict, Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

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

    constructor(target: CompanyName, reports: Array<NewsReport>, defenders: Array<CompanyName>, activity: Activity, incoming: Array<MobNews>, outgoings: Array<MobNews>, arMod: ArMod) {
        this.target = target;
        this.reports = reports;
        this.incoming = incoming;
        this.outgoings = outgoings;
        this.defenders = defenders;
        this.activity = activity;
        this.arMod = arMod;
    }

    public static ForReports(reports: Array<NewsReport>, currentPointInTime: PointInTime, target: CompanyName): SpyReport {
        let arMod: Maybe<ArMod> = null;
        const incoming: Array<MobNews> = [];
        const outgoings: Array<MobNews> = [];
        const defenders: IDict<CompanyName> = {};
        const activity: Array<PointInTime> = [];

        for (const report of reports) {
            const tickDifference: Ticks = PointInTime.Subtract(currentPointInTime, report.time);

            if (isNull(arMod) && NewsReport.isBattle(report) && BattleReport.isDefendingSelf(report.content, target)) {
                arMod = ArMod.AdjustForTime(ArMod.Max(), tickDifference);
            }

            if (NewsReport.isMob(report)) {
                const mob: MobNews = report.content;
                const defender: Maybe<CompanyName> = this._getDefender(mob);

                if (!isNull(defender)) {
                    defenders[defender.id] = defender;
                }

                if (mob.isOutgoing) {
                    activity.push(report.time);
                }

                if (!isNull(mob.mob)) {
                    if (mob.isOutgoing) {
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

        if (isNull(arMod)) {
            arMod = ArMod.Min();
        }

        return new SpyReport(target, reports, Object.values(defenders), new Activity(activity), incoming, outgoings, arMod);
    }

    private static _getDefender(mob: MobNews): Maybe<CompanyName> {
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
}
