import { CurrentPointInTimeRepository, Income, Land, LandRepository, PointInTime } from '@actoolkit/domain';

import { OverlayComponentFactory } from '../../shared';

export function throwIt(test: string): never {
    throw new Error(test);
}

export async function incomeFeature(): Promise<void> {
    const fundsElement: HTMLElement = document.getElementById('game-info-funds') ?? throwIt('oops');

    const land: Land = await new LandRepository().get();
    const currentTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const income: Income = Income.ForLand(land, currentTime.season);

    fundsElement.appendChild(OverlayComponentFactory('Income', `
        Per tick: ${income.tick.toString()}</br>
        Per hour: ${income.hour.toString()}</br>
        Per day: ${income.day.toString()}</br>
    `));
}
