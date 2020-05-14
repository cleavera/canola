import { isPage } from '../shared';
import { ticksSinceFeature } from './features/ticks-since.feature';

export async function newsAdditions(): Promise<void> {
    if (!isPage('/news.php')) {
        return;
    }

    await ticksSinceFeature();
}
