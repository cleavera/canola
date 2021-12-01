import { BaseTech } from './base-tech';
import { Funds } from './funds';
import { Ticks } from './ticks';

export class Development {
    public readonly name: string;
    public readonly time: Ticks;
    public readonly cost: Funds;
    public readonly base: BaseTech;
    public readonly progress: Ticks | null;

    public get completed(): boolean {
        if (this.progress === null) {
            return false;
        }

        return this.time.ticks === this.progress.ticks;
    }

    constructor(name: string, time: Ticks, cost: Funds, base: BaseTech, progress: Ticks | null = null) {
        this.name = name;
        this.time = time;
        this.cost = cost;
        this.base = base;
        this.progress = progress;
    }
}
