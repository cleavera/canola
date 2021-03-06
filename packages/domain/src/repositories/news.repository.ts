import { IDomElement } from '@canola/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

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

    private _parseContent(context: CompanyName, contentRow: IDomElement, ticksSinceReport: Ticks): Maybe<INewsContent> {
        const contentString: string = (contentRow.textContent ?? this._throwInvalidContent()).trim();
        const mob: Maybe<MobNews> = this._parseMob(context, contentString, ticksSinceReport);

        if (!isNull(mob)) {
            return mob;
        }

        const recall: Maybe<Recall> = this._parseRecalls(contentString);

        if (!isNull(recall)) {
            return recall;
        }

        return this._parseBattleReport(contentRow);
    }

    private _parseRecalls(contentString: string): Maybe<Recall> {
        const recallMatch: Maybe<RegExpExecArray> = NewsRepository.RECALL_PATTERN.exec(contentString);

        if (isNull(recallMatch)) {
            return null;
        }

        if (isNull(recallMatch[1] ?? null)) {
            return new Recall();
        }

        return new Recall(CompanyName.FromString(recallMatch[1]));
    }

    private _parseBattleReport(contentRow: IDomElement): Maybe<BattleReport> {
        const reportHeaderElement: Maybe<IDomElement> = contentRow.querySelector('table tr') ?? null;

        if (isNull(reportHeaderElement)) {
            return null;
        }

        const reportHeaderMatch: Maybe<RegExpExecArray> = NewsRepository.BATTLE_REPORT_PATTERN.exec(reportHeaderElement.textContent ?? '');

        if (isNull(reportHeaderMatch)) {
            return null;
        }

        const type: MobType = this._getMobType(reportHeaderMatch[1]);
        const target: CompanyName = CompanyName.FromString(reportHeaderMatch[2]);

        return new BattleReport(target, type);
    }

    private _parseMob(context: CompanyName, contentString: string, ticksSinceReport: Ticks): Maybe<MobNews> {
        const outgoingMatch: Maybe<RegExpExecArray> = NewsRepository.OUTGOING_MOB_PATTERN.exec(contentString);

        if (!isNull(outgoingMatch)) {
            const type: MobType = this._getMobType(outgoingMatch[2]);
            const count: number = this._parseCount(outgoingMatch[1]);
            const target: CompanyName = CompanyName.FromString(outgoingMatch[3]);
            const eta: Ticks = Ticks.FromString(outgoingMatch[4]);

            return MobNews.FromOriginalMob(context, count, new Mob(context, target, eta, MobDirection.APPROACHING, type), ticksSinceReport);
        }

        const incomingMatch: Maybe<RegExpExecArray> = NewsRepository.INCOMING_MOB_PATTERN.exec(contentString);

        if (!isNull(incomingMatch)) {
            const type: MobType = this._getMobType(incomingMatch[4]);
            const count: number = this._parseCount(incomingMatch[2]);
            const sender: CompanyName = CompanyName.FromString(incomingMatch[3]);
            const eta: Ticks = Ticks.FromString(incomingMatch[1]);

            return MobNews.FromOriginalMob(context, count, new Mob(sender, context, eta, MobDirection.APPROACHING, type), ticksSinceReport);
        }

        const stealthMatch: Maybe<RegExpExecArray> = NewsRepository.STEALTH_MOB_PATTERN.exec(contentString);

        if (!isNull(stealthMatch)) {
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
