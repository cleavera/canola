import { CropType } from '../constants/crop-type.constant';
import { Season } from '../constants/season.constant';
import { SEED_INCOME_LOOKUP } from '../constants/seed-income.lookup';
import { Land } from './land';
import { Seeds } from './seeds';
import { Ticks } from './ticks';

export class Income {
    public readonly tick: Seeds;
    public readonly hour: Seeds;
    public readonly day: Seeds;

    constructor(perTick: Seeds) {
        this.tick = perTick;
        this.hour = this.per(Ticks.Hour());
        this.day = this.per(Ticks.Day());
    }

    public per(time: Ticks): Seeds {
        return Seeds.Scale(this.tick, time.ticks);
    }

    public static ForLand(land: Land, season: Season): Income {
        const treeIncome: number = SEED_INCOME_LOOKUP[season][CropType.TREE] * land.acres[CropType.TREE];
        const bushIncome: number = SEED_INCOME_LOOKUP[season][CropType.BUSH] * land.acres[CropType.BUSH];
        const flowerIncome: number = SEED_INCOME_LOOKUP[season][CropType.FLOWER] * land.acres[CropType.FLOWER];
        const grassIncome: number = SEED_INCOME_LOOKUP[season][CropType.GRASS] * land.acres[CropType.GRASS];

        return new Income(new Seeds(treeIncome, bushIncome, flowerIncome, grassIncome));
    }
}
