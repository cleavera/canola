import { CropType } from '../constants/crop-type.constant';
import { Season } from '../constants/season.constant';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { Funds } from './funds';
import { Land } from './land';
import { Ticks } from './ticks';

export class Income {
    private static readonly [Season.WINTER]: ICropTypeMap<Funds> = {
        [CropType.TREE]: new Funds(314794),
        [CropType.BUSH]: new Funds(203393),
        [CropType.FLOWER]: new Funds(184634),
        [CropType.GRASS]: new Funds(197667),
        [CropType.UNCULTIVATED]: new Funds(0)
    };

    private static readonly [Season.SPRING]: ICropTypeMap<Funds> = {
        [CropType.TREE]: new Funds(160735),
        [CropType.BUSH]: new Funds(271501),
        [CropType.FLOWER]: new Funds(246428),
        [CropType.GRASS]: new Funds(315850),
        [CropType.UNCULTIVATED]: new Funds(0)
    };

    private static readonly [Season.SUMMER]: ICropTypeMap<Funds> = {
        [CropType.TREE]: new Funds(171243),
        [CropType.BUSH]: new Funds(285692),
        [CropType.FLOWER]: new Funds(392477),
        [CropType.GRASS]: new Funds(277595),
        [CropType.UNCULTIVATED]: new Funds(0)
    };

    private static readonly [Season.AUTUMN]: ICropTypeMap<Funds> = {
        [CropType.TREE]: new Funds(336817),
        [CropType.BUSH]: new Funds(239518),
        [CropType.FLOWER]: new Funds(217410),
        [CropType.GRASS]: new Funds(232757),
        [CropType.UNCULTIVATED]: new Funds(0)
    };

    public readonly tick: Funds;
    public readonly hour: Funds;
    public readonly day: Funds;

    constructor(perTick: Funds) {
        this.tick = perTick;
        this.hour = this.per(Ticks.Hour());
        this.day = this.per(Ticks.Day());
    }

    public per(time: Ticks): Funds {
        return new Funds(this.tick.funds * time.ticks);
    }

    public static ForLand(land: Land, season: Season): Income {
        const treeIncome: number = Income[season][CropType.TREE].funds * land[CropType.TREE].count;
        const bushIncome: number = Income[season][CropType.BUSH].funds * land[CropType.BUSH].count;
        const flowerIncome: number = Income[season][CropType.FLOWER].funds * land[CropType.FLOWER].count;
        const grassIncome: number = Income[season][CropType.GRASS].funds * land[CropType.GRASS].count;

        return new Income(new Funds(treeIncome + bushIncome + flowerIncome + grassIncome));
    }
}
