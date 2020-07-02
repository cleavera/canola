import { CropType } from '../constants/crop-type.constant';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { ISeasonMap } from '../interfaces/season-map.interface';
import { Season } from './season.constant';

export const SEED_INCOME_LOOKUP: ISeasonMap<ICropTypeMap<number>> = {
    [Season.WINTER]: {
        [CropType.TREE]: 1030,
        [CropType.BUSH]: 1291,
        [CropType.FLOWER]: 5053,
        [CropType.GRASS]: 12919
    },
    [Season.SPRING]: {
        [CropType.TREE]: 526,
        [CropType.BUSH]: 1724,
        [CropType.FLOWER]: 6744,
        [CropType.GRASS]: 20644
    },
    [Season.SUMMER]: {
        [CropType.TREE]: 560,
        [CropType.BUSH]: 1814,
        [CropType.FLOWER]: 10741,
        [CropType.GRASS]: 18143
    },
    [Season.AUTUMN]: {
        [CropType.TREE]: 1102,
        [CropType.BUSH]: 1521,
        [CropType.FLOWER]: 5950,
        [CropType.GRASS]: 15213
    }
};
