import { genericAdditions } from './generic';
import { intelAdditions } from './intel';
import { maintenanceAdditions } from './maintenance';
import { newsAdditions } from './news';
import { overviewAdditions } from './overview';

export async function age5(): Promise<void> {
    try {
        await Promise.all([
            genericAdditions(),
            overviewAdditions(),
            newsAdditions(),
            intelAdditions(),
            maintenanceAdditions()
        ]);
    } catch (e) {
        console.error(e);
    }
}
