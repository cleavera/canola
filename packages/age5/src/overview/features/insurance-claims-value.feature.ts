import { Funds, InsuranceClaims, InsuranceRepository, Score } from '@actoolkit/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { OverlayComponentFactory, throwIt } from '../../shared';

export async function insuranceClaimsValueFeature(): Promise<void> {
    const claims: Maybe<InsuranceClaims> = await new InsuranceRepository().getOwn();
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No insurance claims information found');
    const injuredStaffTitleElement: Maybe<HTMLElement> = mainPageElement.querySelector('[onClick^="SwitchSetDisplay(\'Insurances\'"]') ?? null;

    if (isNull(injuredStaffTitleElement) || isNull(claims)) {
        return;
    }

    const total: Funds = claims.value();

    injuredStaffTitleElement.appendChild(OverlayComponentFactory('Total', `
        Cost: ${total.toString()}</br>
        Score: ${Score.ForFunds(total).toString()}
    `));
}
