import { CropType } from '../constants/crop-type.constant';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';

export class Seeds implements ICropTypeMap<number> {
    public [CropType.TREE]: number;
    public [CropType.BUSH]: number;
    public [CropType.FLOWER]: number;
    public [CropType.GRASS]: number;

    constructor(tree: number, bush: number, flower: number, grass: number) {
        this[CropType.TREE] = tree;
        this[CropType.BUSH] = bush;
        this[CropType.FLOWER] = flower;
        this[CropType.GRASS] = grass;
    }
}
