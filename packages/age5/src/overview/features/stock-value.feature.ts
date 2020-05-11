import { Funds, Stocks, StocksRepository } from '@actoolkit/domain';

import { OverlayComponentFactory, throwIt } from '../../shared';

function getTotalSeedsStockedElement(landPlantsTable: HTMLElement): HTMLTableCellElement {
    const rows: ArrayLike<HTMLTableRowElement> = landPlantsTable.querySelectorAll('tr');

    return rows[0].querySelectorAll('td')[4];
}

export async function stockValueFeature(): Promise<void> {
    const landPlantsTable: HTMLElement = document.getElementById('LandPlants') ?? throwIt('Could not find land plants table');
    const totalSeedsStockedElement: HTMLElement = getTotalSeedsStockedElement(landPlantsTable);

    const stocks: Stocks = await new StocksRepository().get();
    const sold: Funds = stocks.seeds.sold();

    totalSeedsStockedElement.appendChild(OverlayComponentFactory('Value', `
        Sold: ${sold.toString()}
    `));
}
