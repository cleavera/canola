import { ActionType, Staff, Units, UnitsRepository, UnitStats, Workforce, WorkforceRepository } from '@canola/domain';

import { OverlayComponentFactory, PositiveTextComponentFactory, throwIt } from '../../shared';

function sumWorkforceActionValue(filteredWorkforce: Workforce): number {
    return filteredWorkforce.staff.reduce((total: number, staff: Staff): number => {
        return total + (staff.amount * (staff.stats.action.amount ?? 0));
    }, 0);
}

function getHarvesterEquivalent(workforce: Workforce, units: Units): number {
    const totalGardens: number = sumWorkforceActionValue(workforce.getForActionType(ActionType.GARDENS));
    const harvester: UnitStats = units.getByName('Harvester') ?? throwIt('Could not find information on harvester');

    return Math.floor(totalGardens / (harvester.action.amount as number));
}

function getGardenerEquivalent(workforce: Workforce, units: Units): number {
    const totalGardens: number = sumWorkforceActionValue(workforce.getForActionType(ActionType.GARDENS));
    const gardener: UnitStats = units.getByName('Gardener') ?? throwIt('Could not find information on gardener');

    return Math.floor(totalGardens / (gardener.action.amount as number));
}

export async function staffValueFeature(): Promise<void> {
    const workforce: Workforce = await new WorkforceRepository().getOwn();
    const units: Units = await new UnitsRepository().get();
    const mainPageElement: HTMLElement = document.getElementById('main-page-data') ?? throwIt('No staff information found');
    const staffTitleElement: HTMLElement = mainPageElement.querySelector('[onClick^="SwitchSetDisplay(\'Staff\'"]') ?? throwIt('No staff information found');

    staffTitleElement.appendChild(PositiveTextComponentFactory(`[${workforce.value().toString()}]`));
    staffTitleElement.appendChild(OverlayComponentFactory('Totals', `
        Gardener equivalent: ${getGardenerEquivalent(workforce, units).toLocaleString('en')}</br>
        Harvesters equivalent: ${getHarvesterEquivalent(workforce, units).toLocaleString('en')}
    `));
}
