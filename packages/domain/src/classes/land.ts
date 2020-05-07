import { Acres } from './acres';

export class Land {
    public tree: Acres;
    public bush: Acres;
    public flower: Acres;
    public grass: Acres;
    public uncultivated: number;

    constructor(tree: Acres, bush: Acres, flower: Acres, grass: Acres, uncultivated: number) {
        this.tree = tree;
        this.bush = bush;
        this.flower = flower;
        this.grass = grass;
        this.uncultivated = uncultivated;
    }
}
