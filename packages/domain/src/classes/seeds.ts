import { CropType } from '../constants/crop-type.constant';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { Funds } from './funds';
import { Plants } from './plants';

export class Seeds implements ICropTypeMap<number> {
    private static readonly SOLD: ICropTypeMap<Funds> = {
        [CropType.TREE]: new Funds(142),
        [CropType.BUSH]: new Funds(75),
        [CropType.FLOWER]: new Funds(18),
        [CropType.GRASS]: new Funds(7)
    };

    private static readonly PLANTING_RATE: ICropTypeMap<number> = {
        [CropType.TREE]: 0.97,
        [CropType.BUSH]: 0.9,
        [CropType.FLOWER]: 0.87,
        [CropType.GRASS]: 0.85
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
            Funds.Scale(Seeds.SOLD[CropType.TREE], this[CropType.TREE]),
            Funds.Scale(Seeds.SOLD[CropType.BUSH], this[CropType.BUSH]),
            Funds.Scale(Seeds.SOLD[CropType.FLOWER], this[CropType.FLOWER]),
            Funds.Scale(Seeds.SOLD[CropType.GRASS], this[CropType.GRASS])
        );
    }

    public plants(): Plants {
        return new Plants(
            Seeds.PLANTING_RATE[CropType.TREE] * this[CropType.TREE],
            Seeds.PLANTING_RATE[CropType.BUSH] * this[CropType.BUSH],
            Seeds.PLANTING_RATE[CropType.FLOWER] * this[CropType.FLOWER],
            Seeds.PLANTING_RATE[CropType.GRASS] * this[CropType.GRASS]
        );
    }
}
