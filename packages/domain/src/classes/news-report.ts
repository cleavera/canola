import { Maybe } from '@cleavera/types';

import { INewsContent } from '../interfaces/news-content.interface';
import { BattleReport } from './battle-report';
import { MobNews } from './mob-news';
import { PointInTime } from './point-in-time';
import { Recall } from './recall';

export class NewsReport<TContent extends Maybe<INewsContent> = Maybe<INewsContent>> {
    public time: PointInTime;
    public content: TContent;

    constructor(time: PointInTime, content: TContent) {
        this.time = time;
        this.content = content;
    }

    public static isBattle(report: NewsReport): report is NewsReport<BattleReport> {
        return report.content instanceof BattleReport;
    }

    public static isMob(report: NewsReport): report is NewsReport<MobNews> {
        return report.content instanceof MobNews;
    }

    public static isRecall(report: NewsReport): report is NewsReport<Recall> {
        return report.content instanceof Recall;
    }
}
