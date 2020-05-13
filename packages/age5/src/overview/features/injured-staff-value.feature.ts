import { Injuries, InjuriesRepository, Score } from '@actoolkit/domain';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { OverlayComponentFactory, throwIt } from '../../shared';

export async function injuredStaffValueFeature(): Promise<void> {
    const injuries: Maybe<Injuries> = await new InjuriesRepository().get();
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No injured staff information found');
    const injuredStaffTitleElement: Maybe<HTMLElement> = mainPageElement.querySelector('[onClick^="SwitchSetDisplay(\'Injuries\'"]') ?? null;

    if (isNull(injuredStaffTitleElement) || isNull(injuries)) {
        return;
    }

    injuredStaffTitleElement.appendChild(OverlayComponentFactory('Total', `
        Number: ${injuries.totalNumber().toLocaleString('en')}</br>
        Cost: ${injuries.value().toString()}</br>
        Score: ${Score.ForFunds(injuries.value()).toString()}
    `));
}
