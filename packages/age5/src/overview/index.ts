import { isPage } from '../shared';
import { arModFeature } from './features/ar-mod.feature';
import { injuredStaffValueFeature } from './features/injured-staff-value.feature';
import { insuranceClaimsValueFeature } from './features/insurance-claims-value.feature';
import { outgoingValueFeature } from './features/outgoing-value.feature';
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
        injuredStaffValueFeature(),
        insuranceClaimsValueFeature(),
        outgoingValueFeature(),
        arModFeature()
    ]);
}
