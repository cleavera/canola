import { isPage } from '../shared';
import { injuredStaffValueFeature } from './features/injured-staff-value.feature';
import { requiredHarvestersFeature } from './features/required-harvesters.feature';
import { staffValueFeature } from './features/staff-value.feature';
import { stockValueFeature } from './features/stock-value.feature';

export async function overviewAdditions(): Promise<void> {
    if (!isPage('/overview.php')) {
        return;
    }

    await Promise.all([
        stockValueFeature(),
        requiredHarvestersFeature(),
        staffValueFeature(),
        injuredStaffValueFeature()
    ]);
}
