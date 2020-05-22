import { Maybe } from '@cleavera/types';

import { INewsContent } from '../interfaces/news-content.interface';
import { PointInTime } from './point-in-time';

export class NewsReport {
    public time: PointInTime;
    public content: Maybe<INewsContent>;

    constructor(time: PointInTime, content: Maybe<INewsContent>) {
        this.time = time;
        this.content = content;
    }
}
