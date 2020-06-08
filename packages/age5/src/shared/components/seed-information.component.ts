import { Seeds } from '@actoolkit/domain';

import { OverlayComponentFactory } from './overlay.component';

export function SeedInformationComponentFactory(seeds: Seeds): HTMLButtonElement {
    return OverlayComponentFactory('Value', `
        Sold: ${seeds.sold().toString()}</br>
        Planted: ${seeds.plants().sold().toString()}</br>
        Gardeners required: ${seeds.gardeners().toLocaleString('en')}
    `);
}
