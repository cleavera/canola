import { Injuries, InjuriesRepository, Score } from '@canola/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

export async function injuredStaffValueFeature(): Promise<void> {
    const injuries: Injuries | null = await new InjuriesRepository().getOwn();
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No injured staff information found');
    const injuredStaffTitleElement: HTMLElement | null = mainPageElement.querySelector('[onClick^="SwitchSetDisplay(\'Injuries\'"]') ?? null;

    if (injuredStaffTitleElement === null || injuries === null) {
        return;
    }

    injuredStaffTitleElement.appendChild(OverlayComponentFactory('Total', `
        Number: ${injuries.totalNumber().toLocaleString('en')}</br>
        Cost: ${injuries.value().toString()}</br>
        Score: ${Score.ForFunds(injuries.value()).toString()}
    `));
}
