import { Acres } from './acres';
import { Plants } from './plants';

export class Land {
    public acres: Acres;
    public plantedPlants: Plants;

    constructor(acres: Acres, plantedPlants: Plants) {
        this.acres = acres;
        this.plantedPlants = plantedPlants;
    }
}
