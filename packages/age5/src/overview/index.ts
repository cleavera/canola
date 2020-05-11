import { isPage } from '../shared';
import { stockValueFeature } from './features/stock-value.feature';

export async function overviewAdditions(): Promise<void> {
    if (!isPage('/overview.php')) {
        return;
    }

    await stockValueFeature();
}
