import { Land, LandRepository, Season } from '@actoolkit/domain';

import { OverlayComponentFactory } from '../../shared';
import { LandSeedPlantsModel } from '../models/land-seed-plants.model';

const HARVESTERS_TO_COMBINE_RATIO: number = 24;

function harvestersToCombines(harvesters: number): number {
    return Math.ceil(harvesters / HARVESTERS_TO_COMBINE_RATIO);
}

export async function requiredHarvestersFeature(): Promise<void> {
    const lsp: LandSeedPlantsModel = LandSeedPlantsModel.ForCurrentPage();

    const land: Land = await new LandRepository().get();
    const winter: number = land.harvesters(Season.WINTER);
    const spring: number = land.harvesters(Season.SPRING);
    const summer: number = land.harvesters(Season.SUMMER);
    const autumn: number = land.harvesters(Season.AUTUMN);

    lsp.getLand().appendChild(OverlayComponentFactory('Harvesters required <span class="friendly">[Combines]</span>', `
        Winter: ${winter.toLocaleString('en')} <span class="friendly">[${harvestersToCombines(winter).toLocaleString('en')}]</span></br>
        Spring: ${spring.toLocaleString('en')} <span class="friendly">[${harvestersToCombines(spring).toLocaleString('en')}]</span></br>
        Summer: ${summer.toLocaleString('en')} <span class="friendly">[${harvestersToCombines(summer).toLocaleString('en')}]</span></br>
        Autumn: ${autumn.toLocaleString('en')} <span class="friendly">[${harvestersToCombines(autumn).toLocaleString('en')}]</span>
    `));
}
