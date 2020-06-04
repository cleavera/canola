import { Maybe } from '@cleavera/types';

import { Funds } from './funds';
import { Score } from './score';
import { Ticks } from './ticks';

export class ArMod {
    public static readonly DEFAULT_MIN_AR_TRIGGERING_RATIO: number = 1.45;
    public static readonly DROP_PER_TICK: number = 0.0012;
    public static readonly MAX_AR_MOD: number = 0.9;

    public mod: number;

    constructor(mod: number) {
        this.mod = mod;
    }

    public toString(): string {
        return `${(this.mod * 100).toFixed(2)}%`;
    }

    public triggerValue(score: Score): Funds {
        const triggerRatio: number = ArMod.DEFAULT_MIN_AR_TRIGGERING_RATIO - (ArMod.DEFAULT_MIN_AR_TRIGGERING_RATIO * this.mod);

        return Funds.Scale(score.toFunds(), triggerRatio);
    }

    public static FromString(str: string): ArMod {
        let mod: number = parseFloat(str) / 100;

        if (isNaN(mod)) {
            mod = 0;
        }

        return new ArMod(mod);
    }

    public static FromMobRatio(ratio: number): Maybe<ArMod> {
        const mod: number = Math.max(0, 1 - (ratio / this.DEFAULT_MIN_AR_TRIGGERING_RATIO));

        if (mod > this.MAX_AR_MOD) {
            return null;
        }

        return new ArMod(mod);
    }

    public static Max(): ArMod {
        return new ArMod(this.MAX_AR_MOD);
    }

    public static Min(): ArMod {
        return new ArMod(0);
    }

    public static AdjustForTime(initialMod: ArMod, time: Ticks): ArMod {
        return new ArMod(initialMod.mod - (time.ticks * this.DROP_PER_TICK));
    }
}
