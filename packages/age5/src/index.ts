import { genericAdditions } from './generic';
import { intelAdditions } from './intel';
import { newsAdditions } from './news';
import { overviewAdditions } from './overview';

export async function age5(): Promise<void> {
    try {
        await Promise.all([
            genericAdditions(),
            overviewAdditions(),
            newsAdditions(),
            intelAdditions()
        ]);
    } catch (e) {
        console.error(e);
    }
}
