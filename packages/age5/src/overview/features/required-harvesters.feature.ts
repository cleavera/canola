import { Land, LandRepository, Season } from '@canola/domain';

import { OverlayComponentFactory } from '../../shared';
import { LandSeedPlantsModel } from '../models/land-seed-plants.model';

const HARVESTERS_TO_COMBINE_RATIO: number = 24;

function harvestersToCombines(harvesters: number): number {
    return Math.ceil(harvesters / HARVESTERS_TO_COMBINE_RATIO);
}

export async function requiredHarvestersFeature(): Promise<void> {
    const lsp: LandSeedPlantsModel = LandSeedPlantsModel.ForCurrentPage();

    const land: Land = await new LandRepository().getOwn();
    const winter: number = land.acres.harvesters(Season.WINTER);
    const spring: number = land.acres.harvesters(Season.SPRING);
    const summer: number = land.acres.harvesters(Season.SUMMER);
    const autumn: number = land.acres.harvesters(Season.AUTUMN);

    lsp.getLand().appendChild(OverlayComponentFactory('Harvesters required <span class="friendly">[Combines]</span>', `
        Winter: ${winter.toLocaleString('en')} <span class="friendly">[${harvestersToCombines(winter).toLocaleString('en')}]</span></br>
        Spring: ${spring.toLocaleString('en')} <span class="friendly">[${harvestersToCombines(spring).toLocaleString('en')}]</span></br>
        Summer: ${summer.toLocaleString('en')} <span class="friendly">[${harvestersToCombines(summer).toLocaleString('en')}]</span></br>
        Autumn: ${autumn.toLocaleString('en')} <span class="friendly">[${harvestersToCombines(autumn).toLocaleString('en')}]</span>
    `));
}
