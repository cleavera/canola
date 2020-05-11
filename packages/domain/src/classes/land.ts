import { CropType } from '../constants/crop-type.constant';
import { Acres } from './acres';

export class Land {
    public readonly [CropType.TREE]: Acres;
    public readonly [CropType.BUSH]: Acres;
    public readonly [CropType.FLOWER]: Acres;
    public readonly [CropType.GRASS]: Acres;
    public readonly [CropType.UNCULTIVATED]: Acres;
    public readonly total: Acres;

    constructor(tree: Acres, bush: Acres, flower: Acres, grass: Acres, uncultivated: Acres) {
        this[CropType.TREE] = tree;
        this[CropType.BUSH] = bush;
        this[CropType.FLOWER] = flower;
        this[CropType.GRASS] = grass;
        this[CropType.UNCULTIVATED] = uncultivated;

        this.total = Acres.Total(tree, bush, flower, grass, uncultivated);
    }
}
