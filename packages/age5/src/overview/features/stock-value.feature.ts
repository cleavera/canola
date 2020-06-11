import { Stocks, StocksRepository } from '@canola/domain';

import { OverlayComponentFactory, SeedInformationComponentFactory } from '../../shared';
import { LandSeedPlantsModel } from '../models/land-seed-plants.model';

export async function stockValueFeature(): Promise<void> {
    const lsp: LandSeedPlantsModel = LandSeedPlantsModel.ForCurrentPage();
    const stocks: Stocks = await new StocksRepository().getOwn();

    lsp.getSeeds().appendChild(SeedInformationComponentFactory(stocks.seeds));
    lsp.getPlants().appendChild(OverlayComponentFactory('Value', `
        Sold: ${stocks.plants.sold().toString()}</br>
    `));
}
