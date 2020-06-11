import { Funds, Plants, Score, Seeds } from '@canola/domain';

import { OverlayComponentFactory } from './overlay.component';

export function SeedInformationComponentFactory(seeds: Seeds): HTMLButtonElement {
    const seedsPlanted: Plants = seeds.plants();
    const difference: Funds = new Funds(seedsPlanted.sold().funds - seeds.sold().funds);

    return OverlayComponentFactory('Value', `
        Sold: ${seeds.sold().toString()}</br>
        Planted: ${seedsPlanted.sold().toString()}</br>
        Gardeners required: ${seeds.gardeners().toLocaleString('en')}</br>
        Score gain: ${Score.ForFunds(difference).toString()}
    `);
}
