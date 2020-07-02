import { CropType, CurrentPointInTimeRepository, DriveByReport, Income, IntelRepository, PointInTime, Seeds, Ticks } from '@canola/domain';

import { OverlayComponentFactory, PositiveTextComponentFactory, SeedInformationComponentFactory, throwIt } from '../../shared';
import { isDriveByReport } from '../helpers/is-drive-by-report.helper';

function getTicksSincePlanted(income: Income, seeds: Seeds): Ticks {
    const ticksSinceTreePlanted: number = seeds[CropType.TREE] / income.tick[CropType.TREE];
    const ticksSinceBushPlanted: number = seeds[CropType.BUSH] / income.tick[CropType.BUSH];
    const ticksSinceFlowerPlanted: number = seeds[CropType.FLOWER] / income.tick[CropType.FLOWER];
    const ticksSinceGrassPlanted: number = seeds[CropType.GRASS] / income.tick[CropType.GRASS];

    return new Ticks(Math.ceil(Math.min(ticksSinceTreePlanted, ticksSinceBushPlanted, ticksSinceFlowerPlanted, ticksSinceGrassPlanted)));
}

async function driveByReport(intelRepository: IntelRepository, targetElement: HTMLElement, reportElement: HTMLElement): Promise<void> {
    const report: DriveByReport = await intelRepository.parseDriveBy(targetElement, reportElement);
    const [landTitleCell, plantTitleCell, seedTitleCell]: Array<HTMLTableCellElement> = Array.from(reportElement.querySelectorAll('tr:nth-child(6n + 1) td'));

    const currentTime: PointInTime = await new CurrentPointInTimeRepository().get();
    const income: Income = Income.ForLand(report.land, currentTime.season);

    landTitleCell.appendChild(OverlayComponentFactory('Income', `
        Per tick: ${income.tick.plants().sold().toString()}</br>
        Per hour: ${income.hour.plants().sold().toString()}</br>
        Per day: ${income.day.plants().sold().toString()}</br>
        Harvesters: ${report.land.acres.harvesters(currentTime.season).toLocaleString('en')}
    `));

    const ticksSincePlanted: Ticks = getTicksSincePlanted(income, report.stocks.seeds);

    plantTitleCell.appendChild(PositiveTextComponentFactory(`[${report.stocks.plants.sold()}]`, 'Value'));
    seedTitleCell.appendChild(PositiveTextComponentFactory(`~${ticksSincePlanted.ticks.toLocaleString()} ticks since planted`));
    seedTitleCell.appendChild(SeedInformationComponentFactory(report.stocks.seeds));
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
