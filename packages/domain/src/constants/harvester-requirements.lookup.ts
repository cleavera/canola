import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { ISeasonMap } from '../interfaces/season-map.interface';
import { CropType } from './crop-type.constant';
import { Season } from './season.constant';

const HARVESTER_REQUIRED = {
    [CropType.TREE]: {
        LOW: 43,
        HIGH: 92.35
    },
    [CropType.BUSH]: 136.40,
    [CropType.FLOWER]: {
        LOW: 530.43,
        HIGH: 840
    },
    [CropType.GRASS]: {
        LOW: 1363.97,
        HIGH: 2478
    }
};

export const HARVESTER_REQUIRED_LOOKUP: ISeasonMap<ICropTypeMap<number>> = {
    [Season.WINTER]: {
        [CropType.TREE]: HARVESTER_REQUIRED[CropType.TREE].HIGH,
        [CropType.BUSH]: HARVESTER_REQUIRED[CropType.BUSH],
        [CropType.FLOWER]: HARVESTER_REQUIRED[CropType.FLOWER].LOW,
        [CropType.GRASS]: HARVESTER_REQUIRED[CropType.GRASS].LOW
    },
    [Season.SPRING]: {
        [CropType.TREE]: HARVESTER_REQUIRED[CropType.TREE].LOW,
        [CropType.BUSH]: HARVESTER_REQUIRED[CropType.BUSH],
        [CropType.FLOWER]: HARVESTER_REQUIRED[CropType.FLOWER].LOW,
        [CropType.GRASS]: HARVESTER_REQUIRED[CropType.GRASS].HIGH
    },
    [Season.SUMMER]: {
        [CropType.TREE]: HARVESTER_REQUIRED[CropType.TREE].LOW,
        [CropType.BUSH]: HARVESTER_REQUIRED[CropType.BUSH],
        [CropType.FLOWER]: HARVESTER_REQUIRED[CropType.FLOWER].HIGH,
        [CropType.GRASS]: HARVESTER_REQUIRED[CropType.GRASS].LOW
    },
    [Season.AUTUMN]: {
        [CropType.TREE]: HARVESTER_REQUIRED[CropType.TREE].HIGH,
        [CropType.BUSH]: HARVESTER_REQUIRED[CropType.BUSH],
        [CropType.FLOWER]: HARVESTER_REQUIRED[CropType.FLOWER].LOW,
        [CropType.GRASS]: HARVESTER_REQUIRED[CropType.GRASS].LOW
    }
};
