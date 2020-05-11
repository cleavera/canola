import { CropType } from '../constants/crop-type.constant';
import { HARVESTER_REQUIRED_LOOKUP } from '../constants/harvester-requirements.lookup';
import { Season } from '../constants/season.constant';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { Acres } from './acres';

export class Land implements ICropTypeMap<Acres> {
    public readonly [CropType.TREE]: Acres;
    public readonly [CropType.BUSH]: Acres;
    public readonly [CropType.FLOWER]: Acres;
    public readonly [CropType.GRASS]: Acres;
    public readonly uncultivated: Acres;
    public readonly total: Acres;

    constructor(tree: Acres, bush: Acres, flower: Acres, grass: Acres, uncultivated: Acres) {
        this[CropType.TREE] = tree;
        this[CropType.BUSH] = bush;
        this[CropType.FLOWER] = flower;
        this[CropType.GRASS] = grass;
        this.uncultivated = uncultivated;

        this.total = Acres.Total(tree, bush, flower, grass, uncultivated);
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
        return this[type].count * lookupTable[type];
    }
}
