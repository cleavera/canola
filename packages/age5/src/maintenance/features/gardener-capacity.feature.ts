import { ActionType, Workforce, WorkforceRepository } from '@canola/domain';

import { TableCellComponentFactory, TableRowComponentFactory, TextComponentFactory, throwIt } from '../../shared';

export async function gardenerCapacityFeature(): Promise<void> {
    const maintenanceTableElement: HTMLTableElement = document.querySelector('#main-page-data form > table > tbody') ?? throwIt('Could not find maintenance information');
    const workforce: Workforce = await new WorkforceRepository().getOwn();
    const gardenerCapacity: number = workforce.totalActionAmountForType(ActionType.GARDENS);

    maintenanceTableElement.appendChild(
        TableRowComponentFactory(
            TableCellComponentFactory([
                TextComponentFactory(`Your gardeners have a total capacity for planting ${gardenerCapacity.toLocaleString()} crops during day time`)
            ], 3)
        )
    );
}
