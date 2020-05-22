import { Maybe } from '@cleavera/types';

import { Mob } from './mob';
import { PointInTime } from './point-in-time';

export class NewsReport {
    public time: PointInTime;
    public content: Maybe<Mob>;

    constructor(time: PointInTime, content: Maybe<Mob>) {
        this.time = time;
        this.content = content;
    }
}
