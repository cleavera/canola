import { CropType } from '..';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { Acres } from './acres';
import { Plants } from './plants';

export class Land {
    private static readonly PLANTS_TO_FILL_ACRE: ICropTypeMap<number> = {
        [CropType.TREE]: 180,
        [CropType.BUSH]: 360,
        [CropType.FLOWER]: 800,
        [CropType.GRASS]: 1600
    }

    public acres: Acres;
    public plantedPlants: Plants;

    constructor(acres: Acres, plantedPlants: Plants) {
        this.acres = acres;
        this.plantedPlants = plantedPlants;
    }

    public static FromAcres(total: Acres, filled: Acres): Land {
        const plantedPlants: Plants = new Plants(
            filled[CropType.TREE] * Land.PLANTS_TO_FILL_ACRE[CropType.TREE],
            filled[CropType.BUSH] * Land.PLANTS_TO_FILL_ACRE[CropType.BUSH],
            filled[CropType.FLOWER] * Land.PLANTS_TO_FILL_ACRE[CropType.FLOWER],
            filled[CropType.GRASS] * Land.PLANTS_TO_FILL_ACRE[CropType.GRASS]
        );

        return new Land(
            total,
            plantedPlants
        );
    }
}
