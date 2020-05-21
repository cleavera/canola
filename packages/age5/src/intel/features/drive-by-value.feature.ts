import { CurrentPointInTimeRepository, DriveByReport, Income, IntelRepository, PointInTime } from '@actoolkit/domain';

import { OverlayComponentFactory, PositiveTextComponentFactory, throwIt } from '../../shared';
import { isDriveByReport } from '../helpers/is-drive-by-report.helper';

async function driveByReport(intelRepository: IntelRepository, targetElement: HTMLElement, reportElement: HTMLElement): Promise<void> {
    const report: DriveByReport = await intelRepository.parseDriveBy(targetElement, reportElement);
    const [landTitleCell, plantTitleCell, seedTitleCell]: Array<HTMLTableCellElement> = Array.from(reportElement.querySelectorAll('tr:nth-child(6n + 1) td'));

    const currentTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const income: Income = Income.ForLand(report.land, currentTime.season);

    landTitleCell.appendChild(OverlayComponentFactory('Income', `
        Per tick: ${income.tick.toString()}</br>
        Per hour: ${income.hour.toString()}</br>
        Per day: ${income.day.toString()}</br>
        Harvesters: ${report.land.acres.harvesters(currentTime.season).toLocaleString('en')}
    `));

    plantTitleCell.appendChild(PositiveTextComponentFactory(`[${report.stocks.plants.sold()}]`, 'Value'));
    seedTitleCell.appendChild(OverlayComponentFactory('Value', `
        Sold: ${report.stocks.seeds.sold().toString()}</br>
        Planted: ${report.stocks.seeds.plants().sold().toString()}</br>
        Gardeners required: ${report.stocks.seeds.gardeners().toLocaleString('en')}
    `));
}

export async function driveByValueFeature(): Promise<void> {
    const mainPage: HTMLElement = document.getElementById('main-page-data') ?? throwIt('Cannot find main page data');

    if (!isDriveByReport(mainPage)) {
        return;
    }

    const tableElements: Array<HTMLTableElement> = Array.from(document.querySelectorAll('#main-page-data > table'));
    const intelRepository: IntelRepository = new IntelRepository();
    const promises: Array<Promise<void>> = [];

    for (let x = 0; x < tableElements.length; x += 2) {
        promises.push(driveByReport(intelRepository, tableElements[x], tableElements[x + 1]));
    }

    await Promise.all(promises);
}
