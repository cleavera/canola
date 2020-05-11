import { LandType } from '../constants/land-type.constant';
import { Acres } from './acres';

export class Land {
    public readonly [LandType.TREE]: Acres;
    public readonly [LandType.BUSH]: Acres;
    public readonly [LandType.FLOWER]: Acres;
    public readonly [LandType.GRASS]: Acres;
    public readonly [LandType.UNCULTIVATED]: Acres;
    public readonly total: Acres;

    constructor(tree: Acres, bush: Acres, flower: Acres, grass: Acres, uncultivated: Acres) {
        this[LandType.TREE] = tree;
        this[LandType.BUSH] = bush;
        this[LandType.FLOWER] = flower;
        this[LandType.GRASS] = grass;
        this[LandType.UNCULTIVATED] = uncultivated;

        this.total = Acres.Total(tree, bush, flower, grass, uncultivated);
    }
}
