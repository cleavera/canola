import { CurrentPointInTimeRepository, Income, Land, LandRepository, PointInTime } from '@canola/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

export async function incomeFeature(): Promise<void> {
    const fundsElement: HTMLElement = document.getElementById('game-info-funds') ?? throwIt('Could not find funds information on the page');

    const land: Land = await new LandRepository().getOwn();
    const currentTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const income: Income = Income.ForLand(land, currentTime.season);

    fundsElement.appendChild(OverlayComponentFactory('Income', `
        Per tick: ${income.tick.plants().sold().toString()}</br>
        Per hour: ${income.hour.plants().sold().toString()}</br>
        Per day: ${income.day.plants().sold().toString()}</br>
    `));
}
