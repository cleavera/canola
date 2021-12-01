import { IDomElement } from '@canola/core';

import { BattleReport } from '../classes/battle-report';
import { CompanyName } from '../classes/company-name';
import { Mob } from '../classes/mob';
import { MobNews } from '../classes/mob-news';
import { NewsReport } from '../classes/news-report';
import { PointInTime } from '../classes/point-in-time';
import { Recall } from '../classes/recall';
import { Ticks } from '../classes/ticks';
import { MobDirection } from '../constants/mob-direction.constant';
import { MobType } from '../constants/mob-type.constant';
import { INewsContent } from '../interfaces/news-content.interface';

export class NewsRepository {
    private static readonly OUTGOING_MOB_PATTERN: RegExp = /You sent ([0-9,]+) employees to (attack|defend) ([A-z0-9\s-_|.'{},=]+ \[[0-9]{1,4}]), they are set to arrive in (\d+) ticks/;
    private static readonly INCOMING_MOB_PATTERN: RegExp = /News from your sources is that in (\d+) ticks, ([\d,]+) people from ([A-z0-9\s-_|.'{},=]+? \[[0-9]{1,4}]) will arrive to (attack|defend) you/;
    private static readonly STEALTH_MOB_PATTERN: RegExp = /A stealth mob has been detected, ETA now (\d+) ticks, ([\d,]+) currently visible\. Mob sent from ([A-z0-9\s-_|.'{},=]+? \[[0-9]{1,4}]) to (defend|attack) you/;
    private static readonly BATTLE_REPORT_PATTERN: RegExp = /Battle Report - (Attacking|Defending) ([A-z0-9\s-_|.'{},=]+ \[[0-9]{1,4}])/;
    private static readonly RECALL_PATTERN: RegExp = /^Staff Recalled|You recalled [\d,]+ employees that were sent to defend ([A-z0-9\s-_|.'{},=]+ \[[0-9]{1,4}])/

    public parseNewsReport(context: CompanyName, headerRow: IDomElement, contentRow: IDomElement, currentPointInTime: PointInTime): NewsReport {
        const timeOfDayElement: IDomElement = headerRow.querySelector('td:first-child') ?? this._throwInvalidPointInTime();
        const reportPointInTime: PointInTime = PointInTime.FromDateString(timeOfDayElement.textContent ?? this._throwInvalidPointInTime());

        return new NewsReport(reportPointInTime, this._parseContent(context, contentRow, PointInTime.Subtract(currentPointInTime, reportPointInTime)));
    }

    public isBattle(report: NewsReport): report is NewsReport<BattleReport> {
        return report.content instanceof BattleReport;
    }

    public isMob(report: NewsReport): report is NewsReport<MobNews> {
        return report.content instanceof MobNews;
    }

    public isRecall(report: NewsReport): report is NewsReport<Recall> {
        return report.content instanceof Recall;
    }

    private _parseContent(context: CompanyName, contentRow: IDomElement, ticksSinceReport: Ticks): INewsContent | null {
        const contentString: string = (contentRow.textContent ?? this._throwInvalidContent()).trim();
        const mob: MobNews | null = this._parseMob(context, contentString, ticksSinceReport);

        if (mob !== null) {
            return mob;
        }

        const recall: Recall | null = this._parseRecalls(contentString);

        if (recall !== null) {
            return recall;
        }

        return this._parseBattleReport(contentRow);
    }

    private _parseRecalls(contentString: string): Recall | null {
        const recallMatch: RegExpExecArray | null = NewsRepository.RECALL_PATTERN.exec(contentString);

        if (recallMatch === null) {
            return null;
        }

        if ((recallMatch[1] ?? null) === null) {
            return new Recall();
        }

        return new Recall(CompanyName.FromString(recallMatch[1]));
    }

    private _parseBattleReport(contentRow: IDomElement): BattleReport | null {
        const reportHeaderElement: IDomElement | null = contentRow.querySelector('table tr') ?? null;

        if (reportHeaderElement === null) {
            return null;
        }

        const reportHeaderMatch: RegExpExecArray | null = NewsRepository.BATTLE_REPORT_PATTERN.exec(reportHeaderElement.textContent ?? '');

        if (reportHeaderMatch === null) {
            return null;
        }

        const type: MobType = this._getMobType(reportHeaderMatch[1]);
        const target: CompanyName = CompanyName.FromString(reportHeaderMatch[2]);

        return new BattleReport(target, type);
    }

    private _parseMob(context: CompanyName, contentString: string, ticksSinceReport: Ticks): MobNews | null {
        const outgoingMatch: RegExpExecArray | null = NewsRepository.OUTGOING_MOB_PATTERN.exec(contentString);

        if (outgoingMatch !== null) {
            const type: MobType = this._getMobType(outgoingMatch[2]);
            const count: number = this._parseCount(outgoingMatch[1]);
            const target: CompanyName = CompanyName.FromString(outgoingMatch[3]);
            const eta: Ticks = Ticks.FromString(outgoingMatch[4]);

            return MobNews.FromOriginalMob(context, count, new Mob(context, target, eta, MobDirection.APPROACHING, type), ticksSinceReport);
        }

        const incomingMatch: RegExpExecArray | null = NewsRepository.INCOMING_MOB_PATTERN.exec(contentString);

        if (incomingMatch !== null) {
            const type: MobType = this._getMobType(incomingMatch[4]);
            const count: number = this._parseCount(incomingMatch[2]);
            const sender: CompanyName = CompanyName.FromString(incomingMatch[3]);
            const eta: Ticks = Ticks.FromString(incomingMatch[1]);

            return MobNews.FromOriginalMob(context, count, new Mob(sender, context, eta, MobDirection.APPROACHING, type), ticksSinceReport);
        }

        const stealthMatch: RegExpExecArray | null = NewsRepository.STEALTH_MOB_PATTERN.exec(contentString);

        if (stealthMatch !== null) {
            const type: MobType = this._getMobType(stealthMatch[4]);
            const count: number = this._parseCount(stealthMatch[2]);
            const sender: CompanyName = CompanyName.FromString(stealthMatch[3]);
            const eta: Ticks = Ticks.FromString(stealthMatch[1]);

            return MobNews.FromOriginalMob(context, count, new Mob(sender, context, eta, MobDirection.APPROACHING, type), ticksSinceReport);
        }

        return null;
    }

    private _parseCount(countString: string): number {
        return parseInt(countString.replace(/,/g, ''), 10);
    }

    private _getMobType(typeString: string): MobType {
        if (typeString.toLowerCase().includes('defend')) {
            return MobType.DEFENDING;
        }

        return MobType.ATTACKING;
    }

    private _throwInvalidContent(): never {
        throw new Error('Invalid content');
    }

    private _throwInvalidPointInTime(): never {
        throw new Error('Invalid point in time');
    }
}
