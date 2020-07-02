import { ActionType, Units, UnitsRepository, UnitStats, Workforce, WorkforceRepository } from '@canola/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

function getHarvesterEquivalent(workforce: Workforce, units: Units): number {
    const totalHarvests: number = workforce.totalActionAmountForType(ActionType.HARVESTS);
    const harvester: UnitStats = units.getByName('Harvester') ?? throwIt('Could not find information on harvester');

    return Math.floor(totalHarvests / (harvester.action.amount as number));
}

function getGardenerEquivalent(workforce: Workforce, units: Units): number {
    const totalGardens: number = workforce.totalActionAmountForType(ActionType.GARDENS);
    const gardener: UnitStats = units.getByName('Gardener') ?? throwIt('Could not find information on gardener');

    return Math.floor(totalGardens / (gardener.action.amount as number));
}

export async function workersEquivalentFeature(): Promise<void> {
    const workforce: Workforce = await new WorkforceRepository().getOwn();
    const units: Units = await new UnitsRepository().get();
    const staffTitleElement: HTMLElement = document.querySelector('#main-page-data [onClick^="SwitchSetDisplay(\'Staff\'"]') ?? throwIt('No staff information found');

    staffTitleElement.appendChild(OverlayComponentFactory('Totals', `
        Gardener equivalent: ${getGardenerEquivalent(workforce, units).toLocaleString('en')}</br>
        Harvesters equivalent: ${getHarvesterEquivalent(workforce, units).toLocaleString('en')}
    `));
}
