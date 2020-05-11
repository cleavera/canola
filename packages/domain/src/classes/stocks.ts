import { Plants } from './plants';
import { Seeds } from './seeds';

export class Stocks {
    public seeds: Seeds;
    public plants: Plants;

    constructor(seeds: Seeds, plants: Plants) {
        this.seeds = seeds;
        this.plants = plants;
    }
}
