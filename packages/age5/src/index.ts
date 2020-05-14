import { genericAdditions } from './generic';
import { newsAdditions } from './news';
import { overviewAdditions } from './overview';

export async function age5(): Promise<void> {
    try {
        await Promise.all([
            genericAdditions(),
            overviewAdditions(),
            newsAdditions()
        ]);
    } catch (e) {
        console.error(e);
    }
}
