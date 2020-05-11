import { CropType } from '../constants/crop-type.constant';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { Funds } from './funds';

export class Plants implements ICropTypeMap<number> {
    private static readonly SOLD: ICropTypeMap<Funds> = {
        [CropType.TREE]: new Funds(315),
        [CropType.BUSH]: new Funds(175),
        [CropType.FLOWER]: new Funds(42),
        [CropType.GRASS]: new Funds(18)
    };

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

    public sold(): Funds {
        return Funds.Sum(
            Funds.Scale(Plants.SOLD[CropType.TREE], this[CropType.TREE]),
            Funds.Scale(Plants.SOLD[CropType.BUSH], this[CropType.BUSH]),
            Funds.Scale(Plants.SOLD[CropType.FLOWER], this[CropType.FLOWER]),
            Funds.Scale(Plants.SOLD[CropType.GRASS], this[CropType.GRASS])
        );
    }
}
