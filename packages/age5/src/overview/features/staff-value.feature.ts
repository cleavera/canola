import { Workforce, WorkforceRepository } from '@actoolkit/domain';

import { PositiveTextComponentFactory, throwIt } from '../../shared';

export async function staffValueFeature(): Promise<void> {
    const workforce: Workforce = await new WorkforceRepository().getOwn();
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No staff information found');
    const staffTitleElement: HTMLElement = mainPageElement.querySelector('[onClick^="SwitchSetDisplay(\'Staff\'"]') ?? throwIt('No staff information found');

    staffTitleElement.appendChild(PositiveTextComponentFactory(`[${workforce.value().toString()}]`));
}
