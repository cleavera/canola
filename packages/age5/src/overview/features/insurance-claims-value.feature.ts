import { Funds, InsuranceClaims, InsuranceRepository, Score } from '@canola/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

export async function insuranceClaimsValueFeature(): Promise<void> {
    const claims: InsuranceClaims | null = await new InsuranceRepository().getOwn();
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No insurance claims information found');
    const injuredStaffTitleElement: HTMLElement | null = mainPageElement.querySelector('[onClick^="SwitchSetDisplay(\'Insurances\'"]') ?? null;

    if (injuredStaffTitleElement === null || claims === null) {
        return;
    }

    const total: Funds = claims.value();

    injuredStaffTitleElement.appendChild(OverlayComponentFactory('Total', `
        Cost: ${total.toString()}</br>
        Score: ${Score.ForFunds(total).toString()}
    `));
}
