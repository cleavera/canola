import { Crop } from './crop';

export class Stocks {
    public tree: Crop;
    public bush: Crop;
    public flower: Crop;
    public grass: Crop;

    constructor(tree: Crop, bush: Crop, flower: Crop, grass: Crop) {
        this.tree = tree;
        this.bush = bush;
        this.flower = flower;
        this.grass = grass;
    }
}
