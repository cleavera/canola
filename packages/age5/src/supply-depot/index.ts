import { isPage } from '../shared';
import { sellMostFeature } from './features/sell-most.feature';

export async function supplyDepotAdditions(): Promise<void> {
    if (!isPage('/supplies.php')) {
        return;
    }

    await sellMostFeature();
}
