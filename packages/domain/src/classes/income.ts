import { LandType } from '../constants/land-type.constant';
import { Season } from '../constants/season.constant';
import { ILandTypeMap } from '../interfaces/land-type-map.interface';
import { Funds } from './funds';
import { Land } from './land';
import { Ticks } from './ticks';

export class Income {
    private static readonly [Season.WINTER]: ILandTypeMap<Funds> = {
        [LandType.TREE]: new Funds(314794),
        [LandType.BUSH]: new Funds(203393),
        [LandType.FLOWER]: new Funds(184634),
        [LandType.GRASS]: new Funds(197667),
        [LandType.UNCULTIVATED]: new Funds(0)
    };

    private static readonly [Season.SPRING]: ILandTypeMap<Funds> = {
        [LandType.TREE]: new Funds(160735),
        [LandType.BUSH]: new Funds(271501),
        [LandType.FLOWER]: new Funds(246428),
        [LandType.GRASS]: new Funds(315850),
        [LandType.UNCULTIVATED]: new Funds(0)
    };

    private static readonly [Season.SUMMER]: ILandTypeMap<Funds> = {
        [LandType.TREE]: new Funds(171243),
        [LandType.BUSH]: new Funds(285692),
        [LandType.FLOWER]: new Funds(392477),
        [LandType.GRASS]: new Funds(277595),
        [LandType.UNCULTIVATED]: new Funds(0)
    };

    private static readonly [Season.AUTUMN]: ILandTypeMap<Funds> = {
        [LandType.TREE]: new Funds(336817),
        [LandType.BUSH]: new Funds(239518),
        [LandType.FLOWER]: new Funds(217410),
        [LandType.GRASS]: new Funds(232757),
        [LandType.UNCULTIVATED]: new Funds(0)
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
        const treeIncome: number = Income[season][LandType.TREE].funds * land[LandType.TREE].count;
        const bushIncome: number = Income[season][LandType.BUSH].funds * land[LandType.BUSH].count;
        const flowerIncome: number = Income[season][LandType.FLOWER].funds * land[LandType.FLOWER].count;
        const grassIncome: number = Income[season][LandType.GRASS].funds * land[LandType.GRASS].count;

        return new Income(new Funds(treeIncome + bushIncome + flowerIncome + grassIncome));
    }
}
