import { CropType } from '../constants/crop-type.constant';
import { HARVESTER_REQUIRED_LOOKUP } from '../constants/harvester-requirements.lookup';
import { Season } from '../constants/season.constant';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';

export class Acres implements ICropTypeMap<number> {
    public readonly [CropType.TREE]: number;
    public readonly [CropType.BUSH]: number;
    public readonly [CropType.FLOWER]: number;
    public readonly [CropType.GRASS]: number;
    public readonly uncultivated: number;
    public readonly total: number;

    constructor(tree: number, bush: number, flower: number, grass: number, uncultivated: number) {
        this[CropType.TREE] = tree;
        this[CropType.BUSH] = bush;
        this[CropType.FLOWER] = flower;
        this[CropType.GRASS] = grass;
        this.uncultivated = uncultivated;
        this.total = tree + bush + flower + grass + uncultivated;
    }

    public harvesters(season: Season): number {
        const lookupTable: ICropTypeMap<number> = HARVESTER_REQUIRED_LOOKUP[season];

        return Math.ceil([
            CropType.TREE,
            CropType.BUSH,
            CropType.FLOWER,
            CropType.GRASS
        ].reduce((sum: number, type: CropType) => {
            return sum + this._harvestersForCropType(type, lookupTable);
        }, 0));
    }

    private _harvestersForCropType(type: CropType, lookupTable: ICropTypeMap<number>): number {
        return this[type] * lookupTable[type];
    }
}
