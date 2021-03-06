import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { DevelopmentType } from '../constants/development-type.constant';
import { BaseTech } from './base-tech';
import { Funds } from './funds';
import { Ticks } from './ticks';

export class Development {
    public readonly name: string;
    public readonly time: Ticks;
    public readonly cost: Funds;
    public readonly base: BaseTech;
    public readonly progress: Maybe<Ticks>;

    public get completed(): boolean {
        if (isNull(this.progress)) {
            return false;
        }

        return this.time.ticks === this.progress.ticks;
    }

    constructor(name: string, time: Ticks, cost: Funds, base: BaseTech, progress: Maybe<Ticks> = null) {
        this.name = name;
        this.time = time;
        this.cost = cost;
        this.base = base;
        this.progress = progress;
    }
}
