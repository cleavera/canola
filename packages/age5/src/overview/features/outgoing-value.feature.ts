import { Funds, Outgoings, OutgoingsRepository, Score } from '@actoolkit/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { OverlayComponentFactory, throwIt } from '../../shared';

export async function outgoingValueFeature(): Promise<void> {
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No staff information found');
    const staffTitleElement: Maybe<HTMLElement> = mainPageElement.querySelector('[onClick^="SwitchSetDisplay(\'Outgoing\'"]') ?? throwIt('No staff information found');
    const outgoings: Maybe<Outgoings> = await new OutgoingsRepository().get();

    if (isNull(staffTitleElement) || isNull(outgoings)) {
        return;
    }

    const totalValue: Funds = outgoings.value();

    staffTitleElement.appendChild(OverlayComponentFactory('Total', `
        Cost: ${totalValue.toString()}</br>
        Score: ${Score.ForFunds(totalValue).toString()}
    `));
}
