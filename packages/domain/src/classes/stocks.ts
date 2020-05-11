import { CropType } from '../constants/crop-type.constant';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { Crop } from './crop';

export class Stocks implements ICropTypeMap<Crop> {
    public [CropType.TREE]: Crop;
    public [CropType.BUSH]: Crop;
    public [CropType.FLOWER]: Crop;
    public [CropType.GRASS]: Crop;

    constructor(tree: Crop, bush: Crop, flower: Crop, grass: Crop) {
        this[CropType.TREE] = tree;
        this[CropType.BUSH] = bush;
        this[CropType.FLOWER] = flower;
        this[CropType.GRASS] = grass;
    }
}
