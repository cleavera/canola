import { Maybe } from '@cleavera/types';
import { Funds } from './funds';
import { Score } from './score';

export class ArMod {
    public static readonly DEFAULT_MIN_AR_TRIGGERING_RATIO: number = 1.45;

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
        return new ArMod(parseFloat(str) / 100);
    }

    public static FromMobRatio(ratio: number): Maybe<ArMod> {
        const mod: number = Math.max(0, 1 - (ratio / this.DEFAULT_MIN_AR_TRIGGERING_RATIO));

        if (mod > 0.9) {
            return null;
        }

        return new ArMod(mod);
    }
}
