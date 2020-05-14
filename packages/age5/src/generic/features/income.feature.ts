import { CurrentPointInTimeRepository, Income, Land, LandRepository, PointInTime } from '@actoolkit/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

export async function incomeFeature(): Promise<void> {
    const fundsElement: HTMLElement = document.getElementById('game-info-funds') ?? throwIt('Could not find funds information on the page');

    const land: Land = await new LandRepository().getOwn();
    const currentTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const income: Income = Income.ForLand(land, currentTime.season);

    fundsElement.appendChild(OverlayComponentFactory('Income', `
        Per tick: ${income.tick.toString()}</br>
        Per hour: ${income.hour.toString()}</br>
        Per day: ${income.day.toString()}</br>
    `));
}
