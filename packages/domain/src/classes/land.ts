import { CropType } from '../constants/crop-type.constant';
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
}
