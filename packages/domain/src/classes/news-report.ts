import { Maybe } from '@cleavera/types';

import { INewsContent } from '../interfaces/news-content.interface';
import { PointInTime } from './point-in-time';

export class NewsReport<TContent extends Maybe<INewsContent> = Maybe<INewsContent>> {
    public time: PointInTime;
    public content: TContent;

    constructor(time: PointInTime, content: TContent) {
        this.time = time;
        this.content = content;
    }
}
