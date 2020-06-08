import { isPage } from '../shared';
import { seedValuesFeature } from './features/seed-values.feature';

export async function maintenanceAdditions(): Promise<void> {
    if (!isPage('/maintenance.php')) {
        return;
    }

    await seedValuesFeature();
}
