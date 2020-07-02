import { isPage } from '../shared';
import { gardenerCapacityFeature } from './features/gardener-capacity.feature';
import { seedValuesFeature } from './features/seed-values.feature';

export async function maintenanceAdditions(): Promise<void> {
    if (!isPage('/maintenance.php')) {
        return;
    }

    await Promise.all([
        seedValuesFeature(),
        gardenerCapacityFeature()
    ]);
}
