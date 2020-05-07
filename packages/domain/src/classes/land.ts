import { Acres } from './acres';

export class Land {
    public readonly tree: Acres;
    public readonly bush: Acres;
    public readonly flower: Acres;
    public readonly grass: Acres;
    public readonly uncultivated: Acres;
    public readonly total: Acres;

    constructor(tree: Acres, bush: Acres, flower: Acres, grass: Acres, uncultivated: Acres) {
        this.tree = tree;
        this.bush = bush;
        this.flower = flower;
        this.grass = grass;
        this.uncultivated = uncultivated;

        this.total = Acres.Total(tree, bush, flower, grass, uncultivated);
    }
}
