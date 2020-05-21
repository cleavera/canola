import { isPage } from '../shared';
import { hackValueFeature } from './features/hack-value.feature';

export async function intelAdditions(): Promise<void> {
    if (!isPage('/intelligence.php')) {
        return;
    }

    await hackValueFeature();
}
