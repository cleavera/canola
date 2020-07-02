import { genericAdditions } from './generic';
import { intelAdditions } from './intel';
import { maintenanceAdditions } from './maintenance';
import { newsAdditions } from './news';
import { overviewAdditions } from './overview';
import { supplyDepotAdditions } from './supply-depot';

export async function age5(): Promise<void> {
    try {
        await Promise.all([
            genericAdditions(),
            overviewAdditions(),
            newsAdditions(),
            intelAdditions(),
            maintenanceAdditions(),
            supplyDepotAdditions()
        ]);
    } catch (e) {
        console.error(e);
    }
}
