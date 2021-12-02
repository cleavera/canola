import { CropType, Seeds, Stocks, StocksRepository } from '@canola/domain';

import { SeedInformationComponentFactory, throwIt } from '../../shared';

function getValueCell(row: HTMLElement): HTMLTableCellElement {
    return row.querySelector('td:nth-child(2)') ?? throwIt('No maintenance value information information found');
}

export async function seedValuesFeature(): Promise<void> {
    const maintenanceTable: HTMLElement = document.querySelector('#main-page-data form > table') ?? throwIt('No maintenance information found');
    const rows: ArrayLike<HTMLElement> = maintenanceTable.querySelectorAll('tr') ?? throwIt('No maintenance information found');
    const stocksRepo: StocksRepository = new StocksRepository();
    const stocks: Stocks = await stocksRepo.getOwn();
    const processingStocks: Stocks = await stocksRepo.getOwnProcessingStocks();

    getValueCell(rows[18]).appendChild(SeedInformationComponentFactory(Seeds.FilterForCropType(stocks.seeds, CropType.TREE)));
    getValueCell(rows[19]).appendChild(SeedInformationComponentFactory(Seeds.FilterForCropType(stocks.seeds, CropType.BUSH)));
    getValueCell(rows[20]).appendChild(SeedInformationComponentFactory(Seeds.FilterForCropType(stocks.seeds, CropType.FLOWER)));
    getValueCell(rows[21]).appendChild(SeedInformationComponentFactory(Seeds.FilterForCropType(stocks.seeds, CropType.GRASS)));

    if (processingStocks.seeds.total > 0) {
        rows[rows.length - 1].children[0].appendChild(SeedInformationComponentFactory(processingStocks.seeds));
    }
}
